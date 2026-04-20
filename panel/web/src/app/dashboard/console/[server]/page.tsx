"use client";

import { useConsole } from "@/lib/hooks/useConsole";
import { use, useEffect, useRef } from "react";

export default function ConsolePage({
  params,
}: {
  params: Promise<{ server: string }>;
}) {
  const { server } = use(params);
  const serverId = Number(server);
  const { lines, error } = useConsole(serverId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-2 flex items-center gap-3">
        <h1 className="text-sm font-bold">Console — Server {serverId}</h1>
        {error && (
          <span className="text-xs text-red-400">{error.message}</span>
        )}
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-zinc-800 bg-black p-3">
        {lines.map((l, i) => (
          <div key={i} className="flex gap-2 text-xs leading-5">
            <span className="shrink-0 text-zinc-600">
              {new Date(l.timestamp).toLocaleTimeString()}
            </span>
            <span className="text-green-400 break-all whitespace-pre-wrap">{l.line}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
