import usageReducer from "./slices/usageSlice";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import documentsReducer from "./slices/documentsSlice";
import packagesReducer from "./slices/packagesSlice";
import familyReducer from "./slices/familySlice";

const combinedReducer = combineReducers({
  auth: authReducer,
  usage: usageReducer,
  documents: documentsReducer,
  packages: packagesReducer,
  family: familyReducer,
});

let sessionEpoch = 0;
const requestEpochs = new Map<string, { epoch: number; expiresAt: number }>();
const rootReducer: typeof combinedReducer = (state, action) => {
  const meta = (action as { meta?: { requestId?: string; requestStatus?: string } }).meta;
  const now = Date.now();
  for (const [id, entry] of requestEpochs) if (entry.expiresAt <= now) requestEpochs.delete(id);
  if (meta?.requestId && meta.requestStatus === "pending") {
    if (requestEpochs.size >= 2048) requestEpochs.delete(requestEpochs.keys().next().value!);
    requestEpochs.set(meta.requestId, { epoch: sessionEpoch, expiresAt: now + 10 * 60_000 });
  }
  if (meta?.requestId && ["fulfilled", "rejected"].includes(meta.requestStatus ?? "")) {
    const epoch = requestEpochs.get(meta.requestId);
    requestEpochs.delete(meta.requestId);
    if (!epoch || epoch.epoch !== sessionEpoch) return combinedReducer(state, { type: "@@session/ignore-stale" });
  }
  if (action.type === "auth/logout") { sessionEpoch += 1; requestEpochs.clear(); }
  const incoming = (action as { payload?: { user?: { id?: string } } }).payload?.user?.id;
  const currentUserId = state?.auth?.user?.id;
  const accountChanged = action.type.startsWith("auth/") && meta?.requestStatus === "fulfilled" &&
    incoming && currentUserId && incoming !== currentUserId;
  if (accountChanged) { sessionEpoch += 1; requestEpochs.clear(); }
  return combinedReducer(action.type === "auth/logout" || accountChanged ? undefined : state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
