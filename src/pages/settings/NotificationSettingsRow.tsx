import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";

import type { PushSubscriptionPayload } from "@/lib/api.types";
import { notificationApi } from "@/lib/notification-api";
import { T } from "@/constants/theme";

type NotificationState = "checking" | "off" | "on" | "blocked" | "unsupported" | "unconfigured";

function supported() {
  return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
}

function permission() {
  return supported() ? Notification.permission : "denied";
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

function asPayload(subscription: PushSubscription): PushSubscriptionPayload {
  const json = subscription.toJSON();
  const endpoint = typeof json.endpoint === "string" ? json.endpoint : subscription.endpoint;
  const keys = json.keys ?? {};
  if (!endpoint || !keys.p256dh || !keys.auth) throw new Error("Browser push subscription is incomplete.");
  return { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
}

async function currentSubscription() {
  if (!supported()) return null;
  const registration = await navigator.serviceWorker.getRegistration("/readiness-sw.js")
    ?? await navigator.serviceWorker.getRegistration();
  return registration?.pushManager.getSubscription() ?? null;
}

async function ensureSubscription(publicKey: string) {
  const registration = await navigator.serviceWorker.register("/readiness-sw.js");
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
}

export default function NotificationSettingsRow() {
  const [state, setState] = useState<NotificationState>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        if (!supported()) {
          if (alive) setState("unsupported");
          return;
        }
        const existing = await currentSubscription();
        const status = await notificationApi.status(existing?.endpoint);
        if (!alive) return;
        if (!status.configured) setState("unconfigured");
        else if (permission() === "denied") setState("blocked");
        else setState(status.deviceEnabled && permission() === "granted" ? "on" : "off");
      } catch {
        if (alive) setState("off");
      }
    })();
    return () => { alive = false; };
  }, []);

  const enable = async () => {
    if (!supported()) {
      setState("unsupported");
      toast.error("This browser does not support push notifications.");
      return;
    }
    const status = await notificationApi.status();
    if (!status.configured || !status.publicKey) {
      setState("unconfigured");
      toast.error("Push notifications are not configured on the server.");
      return;
    }
    let nextPermission = permission();
    if (nextPermission === "default") nextPermission = await Notification.requestPermission();
    if (nextPermission === "denied") {
      setState("blocked");
      toast.error("Browser notifications are blocked. Enable them in site permissions for Readiness.");
      return;
    }
    if (nextPermission !== "granted") {
      setState("off");
      toast.error("Notification permission was not granted.");
      return;
    }
    const subscription = await ensureSubscription(status.publicKey);
    const result = await notificationApi.register(asPayload(subscription));
    setState(result.deviceEnabled ? "on" : "off");
    toast.success("Notifications enabled on this device.");
  };

  const disable = async () => {
    setState("off");
    const subscription = await currentSubscription();
    if (!subscription) return;
    await notificationApi.disable(asPayload(subscription)).catch(() => {
      toast.error("This device was turned off locally, but the server could not be updated.");
    });
    await subscription.unsubscribe().catch(() => undefined);
    toast.success("Notifications disabled on this device.");
  };

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (state === "on") await disable();
      else await enable();
    } catch (error) {
      setState("off");
      toast.error(error instanceof Error ? error.message : "Notifications could not be updated.");
    } finally {
      setBusy(false);
    }
  };

  const label = state === "on" ? "On" : "Off";
  const sub = state === "blocked"
    ? "Blocked in browser site permissions"
    : state === "unsupported"
      ? "Not supported in this browser"
      : state === "unconfigured"
        ? "Server push is not configured"
        : "Reminder alerts on this device";
  const enabled = state === "on";

  return (
    <button type="button" onClick={() => void toggle()} disabled={busy || state === "checking"} style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "13px 16px",
      border: 0,
      borderTop: `1px solid ${T.border}`,
      background: "none",
      cursor: busy || state === "checking" ? "wait" : "pointer",
      textAlign: "left",
    }}>
      <Bell size={16} color={T.muted} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.text }}>Notifications</span>
        <span style={{ display: "block", fontSize: 12, color: T.muted, marginTop: 1 }}>{sub}</span>
      </span>
      <span style={{ fontSize: 12.5, color: T.muted, fontFamily: "ui-monospace, monospace" }}>{label}</span>
      <span role="switch" aria-checked={enabled} aria-label="Notifications" style={{
        width: 38,
        height: 22,
        borderRadius: 999,
        padding: 2,
        background: enabled ? T.action : T.raised,
        border: `1px solid ${enabled ? T.action : T.border}`,
        transition: "background 140ms ease",
      }}>
        <span style={{
          display: "block",
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: enabled ? T.actionText : T.muted,
          transform: enabled ? "translateX(16px)" : "translateX(0)",
          transition: "transform 140ms ease",
        }} />
      </span>
    </button>
  );
}
