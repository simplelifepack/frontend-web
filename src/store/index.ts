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
const requestEpochs = new Map<string, number>();
const rootReducer: typeof combinedReducer = (state, action) => {
  const meta = (action as { meta?: { requestId?: string; requestStatus?: string } }).meta;
  if (meta?.requestId && meta.requestStatus === "pending") requestEpochs.set(meta.requestId, sessionEpoch);
  if (meta?.requestId && ["fulfilled", "rejected"].includes(meta.requestStatus ?? "")) {
    const epoch = requestEpochs.get(meta.requestId);
    requestEpochs.delete(meta.requestId);
    if (epoch !== undefined && epoch !== sessionEpoch) return combinedReducer(state, { type: "@@session/ignore-stale" });
  }
  if (action.type === "auth/logout") sessionEpoch += 1;
  return combinedReducer(action.type === "auth/logout" ? undefined : state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
