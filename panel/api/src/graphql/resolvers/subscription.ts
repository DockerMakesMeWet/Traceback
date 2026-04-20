import { subscriber } from "../../redis.js";

export const Subscription = {
  consoleLines: {
    subscribe: async function* (_: unknown, { serverId }: { serverId: number }) {
      const channel = `traceback:console:${serverId}`;
      const sub = subscriber.duplicate();

      const queue: string[] = [];
      let resolve: (() => void) | null = null;

      sub.subscribe(channel);
      sub.on("message", (_ch: string, line: string) => {
        queue.push(line);
        resolve?.();
        resolve = null;
      });

      try {
        while (true) {
          if (queue.length === 0) {
            await new Promise<void>((r) => { resolve = r; });
          }
          const line = queue.shift()!;
          yield {
            consoleLines: {
              serverId,
              line,
              timestamp: new Date().toISOString(),
            },
          };
        }
      } finally {
        sub.unsubscribe(channel);
        sub.disconnect();
      }
    },
  },

  liveActivity: {
    subscribe: async function* () {
      const sub = subscriber.duplicate();
      const channels = ["traceback:activity:command", "traceback:activity:chat"];

      const queue: object[] = [];
      let resolve: (() => void) | null = null;

      sub.subscribe(...channels);
      sub.on("message", (_ch: string, raw: string) => {
        try {
          queue.push(JSON.parse(raw));
          resolve?.();
          resolve = null;
        } catch {
          // ignore malformed messages
        }
      });

      try {
        while (true) {
          if (queue.length === 0) {
            await new Promise<void>((r) => { resolve = r; });
          }
          yield { liveActivity: queue.shift()! };
        }
      } finally {
        sub.unsubscribe(...channels);
        sub.disconnect();
      }
    },
  },
};
