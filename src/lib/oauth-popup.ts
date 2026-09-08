import { useCallback, useEffect, useRef } from "react";

import { API_URL } from "./http-client";

export type OAuthPopupProvider = "gmail" | "drive";
export type OAuthPopupStatus = "connected" | "error";

export type OAuthPopupMessage = {
  description?: string;
  provider?: OAuthPopupProvider;
  reason?: string;
  status?: OAuthPopupStatus;
  type?: string;
};

const allowedOAuthOrigins = new Set([
  window.location.origin,
  new URL(API_URL, window.location.origin).origin,
]);

function isTrustedOAuthMessage(event: MessageEvent<OAuthPopupMessage>) {
  return allowedOAuthOrigins.has(event.origin);
}

function isOAuthMessage(payload: OAuthPopupMessage, provider: OAuthPopupProvider) {
  return payload?.type === `readiness:${provider}-oauth`
    && payload.provider === provider
    && (payload.status === "connected" || payload.status === "error");
}

function openCenteredOAuthPopup(url: string, name: string) {
  const width = 560;
  const height = 720;
  const screenLeft = window.screenLeft ?? window.screenX ?? 0;
  const screenTop = window.screenTop ?? window.screenY ?? 0;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || screen.width;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || screen.height;
  const left = Math.max(0, screenLeft + (viewportWidth - width) / 2);
  const top = Math.max(0, screenTop + (viewportHeight - height) / 2);
  return window.open(
    url,
    name,
    `popup,width=${width},height=${height},left=${Math.round(left)},top=${Math.round(top)}`,
  );
}

type UseGoogleOAuthPopupInput = {
  onCancel: () => void;
  onResult: (message: Required<Pick<OAuthPopupMessage, "provider" | "status">> & OAuthPopupMessage) => void;
  popupName: string;
  provider: OAuthPopupProvider;
};

export function useGoogleOAuthPopup({ provider, popupName, onResult, onCancel }: UseGoogleOAuthPopupInput) {
  const popupRef = useRef<Window | null>(null);
  const handledRef = useRef(false);
  const callbacksRef = useRef({ onResult, onCancel });
  useEffect(() => { callbacksRef.current = { onResult, onCancel }; }, [onResult, onCancel]);
  const closeWatcherRef = useRef<number | null>(null);

  const clearCloseWatcher = useCallback(() => {
    if (closeWatcherRef.current === null) return;
    window.clearInterval(closeWatcherRef.current);
    closeWatcherRef.current = null;
  }, []);

  const cleanupPopup = useCallback((closePopup = false) => {
    clearCloseWatcher();
    if (closePopup) popupRef.current?.close();
    popupRef.current = null;
  }, [clearCloseWatcher]);

  useEffect(() => {
    const listener = (event: MessageEvent<OAuthPopupMessage>) => {
      if (!isTrustedOAuthMessage(event) || !isOAuthMessage(event.data, provider) || handledRef.current) return;
      handledRef.current = true;
      cleanupPopup(true);
      callbacksRef.current.onResult(event.data as Required<Pick<OAuthPopupMessage, "provider" | "status">> & OAuthPopupMessage);
    };
    window.addEventListener("message", listener);
    return () => {
      window.removeEventListener("message", listener);
      cleanupPopup(false);
    };
  }, [cleanupPopup, provider]);

  const openPopup = useCallback((authorizationUrl: string) => {
    handledRef.current = false;
    cleanupPopup(false);
    const popup = openCenteredOAuthPopup(authorizationUrl, popupName);
    if (!popup) return false;
    popupRef.current = popup;
    popup.focus();
    closeWatcherRef.current = window.setInterval(() => {
      if (!popup.closed) return;
      clearCloseWatcher();
      if (handledRef.current) return;
      popupRef.current = null;
      callbacksRef.current.onCancel();
    }, 500);
    return true;
  }, [cleanupPopup, clearCloseWatcher, popupName]);

  const navigatePopup = useCallback((authorizationUrl: string) => {
    if (!popupRef.current || popupRef.current.closed) return false;
    popupRef.current.location.href = authorizationUrl;
    return true;
  }, []);

  return { openPopup, navigatePopup, closePopup: () => cleanupPopup(true) };
}
