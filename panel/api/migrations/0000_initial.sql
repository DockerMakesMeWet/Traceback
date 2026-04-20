CREATE TABLE IF NOT EXISTS "servers" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "api_key_hash" text NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "server_configs" (
  "server_id" integer PRIMARY KEY NOT NULL,
  "world_name" text DEFAULT '*' NOT NULL,
  "log_commands" boolean DEFAULT true NOT NULL,
  "log_chat" boolean DEFAULT true NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "server_configs_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "players" (
  "uuid" uuid PRIMARY KEY NOT NULL,
  "username" text NOT NULL,
  "first_seen" timestamp DEFAULT now() NOT NULL,
  "last_seen" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "command_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "player_uuid" uuid NOT NULL,
  "server_id" integer NOT NULL,
  "world" text NOT NULL,
  "x" double precision DEFAULT 0 NOT NULL,
  "y" double precision DEFAULT 0 NOT NULL,
  "z" double precision DEFAULT 0 NOT NULL,
  "command" text NOT NULL,
  "executed_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "command_logs_player_uuid_players_uuid_fk" FOREIGN KEY ("player_uuid") REFERENCES "players"("uuid") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "command_logs_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "chat_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "player_uuid" uuid NOT NULL,
  "server_id" integer NOT NULL,
  "world" text NOT NULL,
  "message" text NOT NULL,
  "sent_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "chat_logs_player_uuid_players_uuid_fk" FOREIGN KEY ("player_uuid") REFERENCES "players"("uuid") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "chat_logs_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "admin_users" (
  "id" serial PRIMARY KEY NOT NULL,
  "username" text NOT NULL,
  "password_hash" text NOT NULL,
  CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS "command_logs_player_idx" ON "command_logs" ("player_uuid");
CREATE INDEX IF NOT EXISTS "command_logs_server_idx" ON "command_logs" ("server_id");
CREATE INDEX IF NOT EXISTS "command_logs_time_idx" ON "command_logs" ("executed_at" DESC);
CREATE INDEX IF NOT EXISTS "chat_logs_player_idx" ON "chat_logs" ("player_uuid");
CREATE INDEX IF NOT EXISTS "chat_logs_server_idx" ON "chat_logs" ("server_id");
CREATE INDEX IF NOT EXISTS "chat_logs_time_idx" ON "chat_logs" ("sent_at" DESC);
CREATE INDEX IF NOT EXISTS "players_username_idx" ON "players" ("username");
