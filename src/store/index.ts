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

const rootReducer: typeof combinedReducer = (state, action) =>
  combinedReducer(action.type === "auth/logout" ? undefined : state, action);

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
