import { ApolloServer } from "@apollo/server";
import fastifyApollo, { fastifyApolloDrainPlugin } from "@as-integrations/fastify";
import { eq } from "drizzle-orm";
import Fastify from "fastify";
import { useServer } from "graphql-ws/lib/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { verifyServerKey } from "./auth/serverKey.js";
import { db } from "./db/client.js";
import { chatLogs, commandLogs, players, servers } from "./db/schema.js";
import { typeDefs } from "./graphql/schema.js";
import { ChatLog, CommandLog, Query, Server } from "./graphql/resolvers/query.js";
import { Mutation } from "./graphql/resolvers/mutation.js";
import { Subscription } from "./graphql/resolvers/subscription.js";
import { publisher } from "./redis.js";
import { z } from "zod";

const PORT = Number(process.env.PORT ?? 4000);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: { Query, Mutation, Subscription, Server, CommandLog, ChatLog },
});

async function bootstrap() {
  const app = Fastify({ logger: { level: "info" } });

  // --- GraphQL WebSocket server (subscriptions) ---
  const wsServer = new WebSocketServer({ noServer: true });
  const wsCleanup = useServer({ schema }, wsServer);

  // --- Apollo Server (HTTP queries + mutations) ---
  const apollo = new ApolloServer({
    schema,
    plugins: [fastifyApolloDrainPlugin(app)],
  });
  await apollo.start();

  await app.register(fastifyApollo(apollo));

  // --- REST ingest endpoints ---
  const CommandBody = z.object({
    playerUuid: z.string().uuid(),
    serverId: z.number().int(),
    command: z.string().max(512),
    world: z.string(),
    x: z.number().default(0),
    y: z.number().default(0),
    z: z.number().default(0),
  });

  const ChatBody = z.object({
    playerUuid: z.string().uuid(),
    serverId: z.number().int(),
    message: z.string().max(2048),
    world: z.string(),
  });

  app.post("/ingest/command", { preHandler: verifyServerKey }, async (req, reply) => {
    const body = CommandBody.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });
    const d = body.data;

    await upsertPlayer(d.playerUuid);
    const [row] = await db.insert(commandLogs).values({
      playerUuid: d.playerUuid,
      serverId: d.serverId,
      world: d.world,
      x: d.x,
      y: d.y,
      z: d.z,
      command: d.command,
    }).returning();

    await publishActivity("command", row, d.playerUuid, d.serverId, d.world, d.command);
    return reply.status(201).send({ id: row.id });
  });

  app.post("/ingest/chat", { preHandler: verifyServerKey }, async (req, reply) => {
    const body = ChatBody.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });
    const d = body.data;

    await upsertPlayer(d.playerUuid);
    const [row] = await db.insert(chatLogs).values({
      playerUuid: d.playerUuid,
      serverId: d.serverId,
      world: d.world,
      message: d.message,
    }).returning();

    await publishActivity("chat", row, d.playerUuid, d.serverId, d.world, d.message);
    return reply.status(201).send({ id: row.id });
  });

  // --- Admin auth endpoint ---
  app.post("/auth/login", async (req, reply) => {
    const { username, password } = req.body as { username: string; password: string };
    const { loginAdmin } = await import("./auth/adminJwt.js");
    const token = await loginAdmin(username, password);
    if (!token) return reply.status(401).send({ error: "Invalid credentials" });
    return reply.send({ token });
  });

  // Upgrade HTTP to WebSocket for /graphql-ws
  await app.listen({ port: PORT, host: "0.0.0.0" });
  app.server.on("upgrade", (req, socket, head) => {
    if (req.url === "/graphql-ws") {
      wsServer.handleUpgrade(req, socket, head, (client) => {
        wsServer.emit("connection", client, req);
      });
    }
  });

  app.log.info(`Traceback API listening on http://0.0.0.0:${PORT}`);
  app.log.info(`GraphQL: http://localhost:${PORT}/graphql`);
  app.log.info(`GraphQL WS: ws://localhost:${PORT}/graphql-ws`);

  process.on("SIGTERM", async () => {
    await wsCleanup.dispose();
    await app.close();
  });
}

async function upsertPlayer(uuid: string) {
  const [existing] = await db.select().from(players).where(eq(players.uuid, uuid));
  if (existing) {
    await db.update(players).set({ lastSeen: new Date() }).where(eq(players.uuid, uuid));
  } else {
    await db.insert(players).values({ uuid, username: uuid }).onConflictDoNothing();
  }
}

async function publishActivity(
  type: string,
  row: { id: number },
  playerUuid: string,
  serverId: number,
  world: string,
  content: string
) {
  const item = {
    type,
    id: row.id,
    player: { uuid: playerUuid },
    server: { id: serverId },
    world,
    content,
    timestamp: new Date().toISOString(),
  };
  await publisher.publish(`traceback:activity:${type}`, JSON.stringify(item));
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
