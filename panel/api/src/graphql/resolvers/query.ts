import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  chatLogs,
  commandLogs,
  players,
  serverConfigs,
  servers,
} from "../../db/schema.js";

export const Query = {
  servers: async () => {
    return db.select().from(servers);
  },

  server: async (_: unknown, { id }: { id: number }) => {
    const [row] = await db.select().from(servers).where(eq(servers.id, id));
    return row ?? null;
  },

  players: async (
    _: unknown,
    {
      search,
      limit = 50,
      offset = 0,
    }: { search?: string; limit?: number; offset?: number }
  ) => {
    const base = db.select().from(players);
    if (search) {
      return base
        .where(ilike(players.username, `%${search}%`))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(players.lastSeen));
    }
    return base.limit(limit).offset(offset).orderBy(desc(players.lastSeen));
  },

  player: async (_: unknown, { uuid }: { uuid: string }) => {
    const [row] = await db.select().from(players).where(eq(players.uuid, uuid));
    return row ?? null;
  },

  commandLogs: async (
    _: unknown,
    {
      playerUuid,
      serverId,
      limit = 50,
      offset = 0,
    }: {
      playerUuid?: string;
      serverId?: number;
      limit?: number;
      offset?: number;
    }
  ) => {
    const conditions = [];
    if (playerUuid) conditions.push(eq(commandLogs.playerUuid, playerUuid));
    if (serverId) conditions.push(eq(commandLogs.serverId, serverId));

    return db
      .select()
      .from(commandLogs)
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(commandLogs.executedAt));
  },

  chatLogs: async (
    _: unknown,
    {
      playerUuid,
      serverId,
      limit = 50,
      offset = 0,
    }: {
      playerUuid?: string;
      serverId?: number;
      limit?: number;
      offset?: number;
    }
  ) => {
    const conditions = [];
    if (playerUuid) conditions.push(eq(chatLogs.playerUuid, playerUuid));
    if (serverId) conditions.push(eq(chatLogs.serverId, serverId));

    return db
      .select()
      .from(chatLogs)
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(chatLogs.sentAt));
  },
};

// Field resolvers for nested types
export const Server = {
  config: async (parent: { id: number }) => {
    const [row] = await db
      .select()
      .from(serverConfigs)
      .where(eq(serverConfigs.serverId, parent.id));
    return row ?? null;
  },
};

export const CommandLog = {
  player: async (parent: { playerUuid: string }) => {
    const [row] = await db
      .select()
      .from(players)
      .where(eq(players.uuid, parent.playerUuid));
    return row ?? null;
  },
  server: async (parent: { serverId: number }) => {
    const [row] = await db
      .select()
      .from(servers)
      .where(eq(servers.id, parent.serverId));
    return row ?? null;
  },
};

export const ChatLog = {
  player: async (parent: { playerUuid: string }) => {
    const [row] = await db
      .select()
      .from(players)
      .where(eq(players.uuid, parent.playerUuid));
    return row ?? null;
  },
  server: async (parent: { serverId: number }) => {
    const [row] = await db
      .select()
      .from(servers)
      .where(eq(servers.id, parent.serverId));
    return row ?? null;
  },
};

export const ActivityItem = {
  player: (parent: { player: { uuid: string; username: string } }) => parent.player,
  server: async (parent: { server: { id: number; name?: string } }) => {
    if (parent.server.name) return parent.server;
    const [row] = await db.select().from(servers).where(eq(servers.id, parent.server.id));
    return row ?? { id: parent.server.id, name: `Server ${parent.server.id}`, enabled: true, createdAt: new Date().toISOString() };
  },
};
