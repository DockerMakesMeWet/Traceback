"use client";

import { gql, useSubscription } from "@apollo/client";
import { useEffect, useRef, useState } from "react";

const LIVE_ACTIVITY = gql`
  subscription LiveActivity {
    liveActivity {
      type
      id
      player {
        uuid
        username
      }
      server {
        id
        name
      }
      world
      content
      timestamp
    }
  }
`;

interface ActivityItem {
  type: string;
  id: number;
  player: { uuid: string; username: string };
  server: { id: number; name: string };
  world: string;
  content: string;
  timestamp: string;
}

export default function DashboardPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { error } = useSubscription<{ liveActivity: ActivityItem }>(LIVE_ACTIVITY, {
    onData: ({ data }) => {
      if (!data.data?.liveActivity) return;
      setItems((prev) => [data.data!.liveActivity, ...prev].slice(0, 200));
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Live Activity Feed</h1>
      </div>

      {error && (
        <div className="mb-4 rounded border border-yellow-800 bg-yellow-900/20 px-4 py-2 text-sm text-yellow-400">
          Reconnecting…
        </div>
      )}

      <div className="rounded-lg border border-zinc-800 bg-zinc-900">
        {items.length === 0 ? (
          <p className="p-6 text-center text-sm text-zinc-500">
            No activity yet — waiting for events
          </p>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {items.map((item) => (
              <li key={`${item.type}-${item.id}`} className="flex items-start gap-3 px-4 py-2 text-sm">
                <span
                  className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-bold uppercase ${
                    item.type === "command"
                      ? "bg-blue-900 text-blue-300"
                      : "bg-emerald-900 text-emerald-300"
                  }`}
                >
                  {item.type}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-zinc-200">
                    {item.player.username}
                  </span>
                  <span className="mx-1 text-zinc-500">in</span>
                  <span className="text-zinc-400">{item.world}</span>
                  <span className="mx-1 text-zinc-600">—</span>
                  <span className="break-all text-zinc-300">{item.content}</span>
                </div>
                <time className="shrink-0 text-xs text-zinc-600">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </time>
              </li>
            ))}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
