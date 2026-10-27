// @vitest-environment node
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { expect, it } from "vitest";
it("service worker notification navigation rejects protocol-relative and backslash-normalized external URLs",()=>{
  const context=vm.createContext({URL,self:{location:{origin:"https://readines.example"},addEventListener(){}}});
  vm.runInContext(readFileSync(new URL("../../public/readiness-sw.js",import.meta.url),"utf8"),context);
  for(const url of ["//evil.example/","/\\evil.example/","https://evil.example/"])expect(vm.runInContext(`safeNotificationPath(${JSON.stringify(url)})`,context)).toBe("/");
  expect(vm.runInContext('safeNotificationPath("/health?record=one")',context)).toBe("/health?record=one");
});
