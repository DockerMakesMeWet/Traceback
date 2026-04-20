import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db/client.js";
import { servers } from "../db/schema.js";

export async function verifyServerKey(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const key = request.headers["x-traceback-key"];
  if (!key || typeof key !== "string") {
    reply.status(401).send({ error: "Missing X-Traceback-Key header" });
    return;
  }

  const allServers = await db.select().from(servers).where(eq(servers.enabled, true));

  for (const server of allServers) {
    if (await bcrypt.compare(key, server.apiKeyHash)) {
      (request as FastifyRequest & { serverId: number }).serverId = server.id;
      return;
    }
  }

  reply.status(403).send({ error: "Invalid API key" });
}
