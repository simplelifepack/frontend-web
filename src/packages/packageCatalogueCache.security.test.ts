import { afterEach, expect, it } from "vitest";
import { clearInMemoryAuth, setAccessToken } from "@/lib/auth";
import { packagePageCacheKey } from "./packageCatalogueCache";
const token=(sub:string)=>`header.${btoa(JSON.stringify({sub}))}.signature`;
afterEach(()=>clearInMemoryAuth());
it("partitions persistent catalogue cache by account, retaining stable keys through refresh",()=>{
  setAccessToken(token("alice"));const alice=packagePageCacheKey();
  setAccessToken(token("bob"));expect(packagePageCacheKey()).not.toBe(alice);
  setAccessToken(token("alice"));expect(packagePageCacheKey()).toBe(alice);
  clearInMemoryAuth();expect(packagePageCacheKey()).not.toBe(alice);
});
