import { request } from "./http-client";
import type {
  PushNotificationSendResult,
  PushNotificationStatus,
  PushSubscriptionPayload,
} from "./api.types";

export const notificationApi = {
  status: (endpoint?: string) =>
    request<PushNotificationStatus>("/api/notifications/status", {
      method: "POST",
      body: { endpoint },
      requiresAuth: true,
      dedupeMs: 0,
    }),
  register: (subscription: PushSubscriptionPayload) =>
    request<Pick<PushNotificationStatus, "deviceEnabled">>("/api/notifications/subscriptions", {
      method: "POST",
      body: { subscription },
      requiresAuth: true,
    }),
  disable: (subscription: PushSubscriptionPayload) =>
    request<Pick<PushNotificationStatus, "deviceEnabled">>("/api/notifications/subscriptions/disable", {
      method: "POST",
      body: { subscription },
      requiresAuth: true,
    }),
  test: () =>
    request<PushNotificationSendResult>("/api/notifications/test", { method: "POST", requiresAuth: true }),
};
