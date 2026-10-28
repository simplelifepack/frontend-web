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
it("drops completions evicted from the bounded pending-request registry", () => {
  for (let index = 0; index < 2049; index++) store.dispatch(fetchDocuments.pending(`pending-${index}`, undefined));
  store.dispatch(fetchDocuments.fulfilled([{ id: "evicted" } as DocumentRecord], "pending-0", undefined));
  expect(store.getState().documents.items).toEqual([]);
  store.dispatch(fetchDocuments.fulfilled([{ id: "current" } as DocumentRecord], "pending-2048", undefined));
  expect(store.getState().documents.items[0]?.id).toBe("current");
});
