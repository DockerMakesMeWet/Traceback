"use client";

import { gql, useQuery } from "@apollo/client";
import { useState } from "react";

const PLAYERS_QUERY = gql`
  query Players($search: String, $limit: Int, $offset: Int) {
    players(search: $search, limit: $limit, offset: $offset) {
      uuid
      username
      firstSeen
      lastSeen
    }
  }
`;

interface Player {
  uuid: string;
  username: string;
  firstSeen: string;
  lastSeen: string;
}

export default function PlayersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 50;

  const { data, loading, error } = useQuery<{ players: Player[] }>(PLAYERS_QUERY, {
    variables: { search: search || undefined, limit, offset: page * limit },
  });

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Players</h1>
        <a href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-100">
          ← Back
        </a>
      </div>

      <input
        type="search"
        placeholder="Search by username…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        className="mb-4 w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
      />

      {error && <p className="text-sm text-red-400">{error.message}</p>}

      <div className="rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">UUID</th>
              <th className="px-4 py-2">First seen</th>
              <th className="px-4 py-2">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            )}
            {data?.players.map((p) => (
              <tr key={p.uuid} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-4 py-2 font-semibold text-zinc-200">{p.username}</td>
                <td className="px-4 py-2 text-xs text-zinc-500">{p.uuid}</td>
                <td className="px-4 py-2 text-zinc-400">
                  {new Date(p.firstSeen).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-zinc-400">
                  {new Date(p.lastSeen).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="rounded border border-zinc-700 px-3 py-1 text-sm text-zinc-400 hover:text-zinc-100 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={(data?.players.length ?? 0) < limit}
          className="rounded border border-zinc-700 px-3 py-1 text-sm text-zinc-400 hover:text-zinc-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
