import { afterEach, expect, it } from "vitest";
import { store } from "./index";
import { logout, restoreSession } from "./slices/authSlice";
import { fetchDocuments } from "./slices/documentsSlice";
import type { DocumentRecord } from "@/lib/api";
afterEach(()=>store.dispatch(logout()));
it("discards document responses from the previous session",()=>{
  store.dispatch(fetchDocuments.pending("old-documents",undefined));
  store.dispatch(logout());
  store.dispatch(fetchDocuments.fulfilled([{id:"private-alice"} as DocumentRecord],"old-documents",undefined));
  expect(store.getState().documents.items).toEqual([]);
});
it("discards a restoreSession response after logout",()=>{
  store.dispatch(restoreSession.pending("old-session",undefined));
  store.dispatch(logout());
  store.dispatch(restoreSession.fulfilled({accessToken:"late-token",token:"late-token",user:{id:"alice"}} as never,"old-session",undefined));
  expect(store.getState().auth.user).toBeNull();
  expect(store.getState().auth.token).toBeNull();
});
