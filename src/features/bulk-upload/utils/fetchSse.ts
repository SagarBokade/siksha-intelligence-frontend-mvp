/**
 * fetchSse — A minimal Server-Sent Events reader built on fetch().
 *
 * Why not native EventSource?
 *   EventSource cannot send custom request headers (e.g. Authorization: Bearer …).
 *   Spring Security rejects the SSE request without the Bearer token.
 *   Using fetch + ReadableStream lets us set any headers we need.
 *
 * Usage:
 *   const ctrl = fetchSse(url, { Authorization: `Bearer ${token}` }, {
 *     onEvent: (type, data) => { … },
 *     onError: (err)       => { … },
 *     onDone:  ()          => { … },
 *   });
 *   // To cancel: ctrl.abort();
 */

export interface SseHandlers {
  /** Called for each complete SSE event */
  onEvent: (eventType: string, data: string) => void;
  /** Called on network/parse error */
  onError?: (err: Error) => void;
  /** Called when the stream closes naturally */
  onDone?: () => void;
}

export function fetchSse(
  url: string,
  headers: Record<string, string>,
  handlers: SseHandlers
): AbortController {
  const ctrl = new AbortController();

  (async () => {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
          ...headers,
        },
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`SSE connection failed: HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      // Parse the SSE text buffer into events
      const flush = () => {
        const blocks = buffer.split(/\n\n/);
        buffer = blocks.pop() ?? ""; // keep the incomplete last block

        for (const block of blocks) {
          let eventType = "message";
          let dataLines: string[] = [];

          for (const line of block.split("\n")) {
            if (line.startsWith("event:")) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLines.push(line.slice(5).trim());
            }
            // id: and retry: are intentionally ignored
          }

          if (dataLines.length > 0) {
            handlers.onEvent(eventType, dataLines.join("\n"));
          }
        }
      };

      // Read the stream chunk by chunk
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        flush();
      }

      // Flush any remaining data after stream closes
      buffer += decoder.decode(); // flush decoder
      flush();

      handlers.onDone?.();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // Intentional cancel — silently ignore
        return;
      }
      handlers.onError?.(
        err instanceof Error ? err : new Error(String(err))
      );
    }
  })();

  return ctrl;
}
