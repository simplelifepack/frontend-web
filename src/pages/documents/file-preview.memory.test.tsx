import { StrictMode } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import FilePreview from "./file-preview";
import { api, type DocumentRecord } from "@/lib/api";
vi.mock("@/store/hooks",()=>({useAppDispatch:()=>vi.fn()}));
vi.mock("./file-preview-header",()=>({default:({onAddSelected}:{onAddSelected:(files:FileList)=>void})=><button onClick={()=>onAddSelected([new File(["synthetic"],"page.png",{type:"image/png"})] as unknown as FileList)}>Choose page</button>}));
vi.mock("./file-preview-content",()=>({default:({header}:{header:React.ReactNode})=><div>{header}</div>}));
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
it("releases every pending-page object URL in StrictMode and aborts preview requests on unmount",async()=>{
  const create=vi.fn(()=>`blob:audit-${create.mock.calls.length}`);const revoke=vi.fn();vi.stubGlobal("URL",Object.assign(URL,{createObjectURL:create,revokeObjectURL:revoke}));
  const signals:AbortSignal[]=[];
  vi.spyOn(api.documents,"preview").mockImplementation((_id,signal)=>{signals.push(signal!);return new Promise((_resolve,reject)=>signal!.addEventListener("abort",()=>reject(new DOMException("aborted","AbortError")),{once:true}));});
  const view=render(<StrictMode><FilePreview doc={{id:"synthetic",source:"UPLOAD",mimeType:"image/png",originalName:"page.png"} as unknown as DocumentRecord} rawExtractedText=""/></StrictMode>);
  fireEvent.click(screen.getByText("Choose page"));await waitFor(()=>expect(create).toHaveBeenCalled());
  await act(async()=>view.unmount());
  expect(signals.every(signal=>signal.aborted)).toBe(true);
  expect(revoke.mock.calls.map(([url])=>url).sort()).toEqual(create.mock.results.map(result=>result.value).sort());
});
