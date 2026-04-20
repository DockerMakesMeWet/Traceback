"use client";

import { useConsole } from "@/lib/hooks/useConsole";
import { useEffect, useRef } from "react";

export default function ConsolePage({
  params,
}: {
  params: { server: string };
}) {
  const serverId = Number(params.server);
  const { lines, error } = useConsole(serverId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="flex h-screen flex-col p-4">
      <div className="mb-2 flex items-center gap-3">
        <a href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-100">
          ← Back
        </a>
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
