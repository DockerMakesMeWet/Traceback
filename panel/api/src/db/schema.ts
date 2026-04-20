import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  apiKeyHash: text("api_key_hash").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const serverConfigs = pgTable("server_configs", {
  serverId: integer("server_id")
    .notNull()
    .references(() => servers.id, { onDelete: "cascade" })
    .primaryKey(),
  worldName: text("world_name").notNull().default("*"),
  logCommands: boolean("log_commands").notNull().default(true),
  logChat: boolean("log_chat").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const players = pgTable("players", {
  uuid: uuid("uuid").primaryKey(),
  username: text("username").notNull(),
  firstSeen: timestamp("first_seen").notNull().defaultNow(),
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
});

export const commandLogs = pgTable("command_logs", {
  id: serial("id").primaryKey(),
  playerUuid: uuid("player_uuid")
    .notNull()
    .references(() => players.uuid, { onDelete: "cascade" }),
  serverId: integer("server_id")
    .notNull()
    .references(() => servers.id, { onDelete: "cascade" }),
  world: text("world").notNull(),
  x: doublePrecision("x").notNull().default(0),
  y: doublePrecision("y").notNull().default(0),
  z: doublePrecision("z").notNull().default(0),
  command: text("command").notNull(),
  executedAt: timestamp("executed_at").notNull().defaultNow(),
});

export const chatLogs = pgTable("chat_logs", {
  id: serial("id").primaryKey(),
  playerUuid: uuid("player_uuid")
    .notNull()
    .references(() => players.uuid, { onDelete: "cascade" }),
  serverId: integer("server_id")
    .notNull()
    .references(() => servers.id, { onDelete: "cascade" }),
  world: text("world").notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});
