type AppErrorReporter = {
  captureException?: (error: unknown, context?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    __appErrorReporter?: AppErrorReporter;
  }
}

export function reportAppError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  window.__appErrorReporter?.captureException?.(error, {
    route: window.location.pathname,
    ...context,
  });
}
