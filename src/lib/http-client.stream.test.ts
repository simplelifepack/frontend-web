import { afterEach, expect, it, vi } from 'vitest';
import { streamRequest } from './http-client';
afterEach(() => vi.unstubAllGlobals());
it('renders streaming deltas before the final result and cleans up the reader', async () => {
  const encoder = new TextEncoder(); let controller: ReadableStreamDefaultController<Uint8Array>;
  const cancel = vi.fn();
  const stream = new ReadableStream<Uint8Array>({ start(value) { controller = value; }, cancel });
  vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
    expect(options.headers.Accept).toBe('text/event-stream');
    expect(JSON.parse(options.body)).toEqual({ packageType: 'Passport', documentLabels: [] });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
  }));
  const deltas: string[] = [];
  const promise = streamRequest('/api/packages/search-or-generate', { packageType: 'Passport', documentLabels: [] }, text => deltas.push(text));
  controller!.enqueue(encoder.encode('event: delta\ndata: {"text":"Pass"}\n\n'));
  await vi.waitFor(() => expect(deltas).toEqual(['Pass']));
  controller!.enqueue(encoder.encode('event: result\ndata: {"package":{"title":"Passport"}}\n\n'));
  expect(await promise).toEqual({ package: { title: 'Passport' } });
  expect(cancel).toHaveBeenCalled();
});
it('handles HTTP quota and in-stream errors', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ code: 'AI_MONTHLY_LIMIT_EXCEEDED', message: 'raw' }), { status: 429 })));
  await expect(streamRequest('/api/packages/search-or-generate', {}, () => undefined)).rejects.toMatchObject({ code: 'AI_MONTHLY_LIMIT_EXCEEDED', message: expect.stringContaining('3 AI actions') });
  vi.stubGlobal('fetch', vi.fn(async () => new Response('event: error\ndata: {"message":"Request failed."}\n\n', { headers: { 'Content-Type': 'text/event-stream' } })));
  await expect(streamRequest('/api/packages/search-or-generate', {}, () => undefined)).rejects.toThrow('Request failed.');
});
