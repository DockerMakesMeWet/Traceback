import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";
import { loginAdmin } from "../../auth/adminJwt.js";
import { db } from "../../db/client.js";
import { serverConfigs, servers } from "../../db/schema.js";

export const Mutation = {
  login: async (
    _: unknown,
    { username, password }: { username: string; password: string }
  ) => {
    const token = await loginAdmin(username, password);
    if (!token) throw new Error("Invalid credentials");
    return { token };
  },

  updateServerConfig: async (
    _: unknown,
    {
      serverId,
      input,
    }: {
      serverId: number;
      input: {
        worldName?: string;
        logCommands?: boolean;
        logChat?: boolean;
      };
    }
  ) => {
    const [existing] = await db
      .select()
      .from(serverConfigs)
      .where(eq(serverConfigs.serverId, serverId));

    if (existing) {
      const [updated] = await db
        .update(serverConfigs)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(serverConfigs.serverId, serverId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(serverConfigs)
      .values({ serverId, ...input })
      .returning();
    return created;
  },

  rotateServerKey: async (_: unknown, { serverId }: { serverId: number }) => {
    const rawKey = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(rawKey, 12);

    await db
      .update(servers)
      .set({ apiKeyHash: hash })
      .where(eq(servers.id, serverId));

    // Return raw key — shown once, never stored
    return rawKey;
  },
};
