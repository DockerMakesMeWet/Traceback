"use client";

import { gql, useMutation, useQuery } from "@apollo/client";
import { useState } from "react";

const SERVERS_QUERY = gql`
  query ServersSettings {
    servers {
      id
      name
      enabled
      config {
        worldName
        logCommands
        logChat
      }
    }
  }
`;

const UPDATE_CONFIG = gql`
  mutation UpdateServerConfig($serverId: Int!, $input: UpdateServerConfigInput!) {
    updateServerConfig(serverId: $serverId, input: $input) {
      serverId
      logCommands
      logChat
      updatedAt
    }
  }
`;

const ROTATE_KEY = gql`
  mutation RotateServerKey($serverId: Int!) {
    rotateServerKey(serverId: $serverId)
  }
`;

interface ServerRow {
  id: number;
  name: string;
  enabled: boolean;
  config: { worldName: string; logCommands: boolean; logChat: boolean } | null;
}

export default function SettingsPage() {
  const { data, loading, error, refetch } = useQuery<{ servers: ServerRow[] }>(SERVERS_QUERY);
  const [updateConfig] = useMutation(UPDATE_CONFIG);
  const [rotateKey] = useMutation<{ rotateServerKey: string }>(ROTATE_KEY);
  const [newKey, setNewKey] = useState<Record<number, string>>({});

  async function handleToggle(
    serverId: number,
    field: "logCommands" | "logChat",
    current: boolean
  ) {
    await updateConfig({ variables: { serverId, input: { [field]: !current } } });
    refetch();
  }

  async function handleRotate(serverId: number) {
    const result = await rotateKey({ variables: { serverId } });
    if (result.data?.rotateServerKey) {
      setNewKey((prev) => ({ ...prev, [serverId]: result.data!.rotateServerKey }));
    }
  }

  if (loading) return <div className="p-6 text-zinc-400">Loading…</div>;
  if (error) return <div className="p-6 text-red-400">{error.message}</div>;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Settings</h1>
        <a href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-100">
          ← Back
        </a>
      </div>

      <div className="space-y-4">
        {data?.servers.map((server) => (
          <div
            key={server.id}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-100">
                {server.name}
                <span className="ml-2 text-xs text-zinc-500">#{server.id}</span>
              </h2>
              <a
                href={`/dashboard/console/${server.id}`}
                className="text-xs text-emerald-400 hover:underline"
              >
                Open console
              </a>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={server.config?.logCommands ?? true}
                  onChange={() =>
                    handleToggle(server.id, "logCommands", server.config?.logCommands ?? true)
                  }
                  className="accent-emerald-500"
                />
                Log commands
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={server.config?.logChat ?? true}
                  onChange={() =>
                    handleToggle(server.id, "logChat", server.config?.logChat ?? true)
                  }
                  className="accent-emerald-500"
                />
                Log chat
              </label>
            </div>

            <div className="mt-3">
              <button
                onClick={() => handleRotate(server.id)}
                className="rounded bg-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-600"
              >
                Rotate API key
              </button>
              {newKey[server.id] && (
                <p className="mt-2 rounded bg-yellow-900/30 px-3 py-2 text-xs text-yellow-300">
                  New key (shown once): <span className="font-bold">{newKey[server.id]}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
