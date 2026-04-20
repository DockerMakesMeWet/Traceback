import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { db } from "../db/client.js";
import { adminUsers } from "../db/schema.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
const ACCESS_TTL = "1h";

export interface AdminPayload {
  sub: number;
  username: string;
}

export function signAccessToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TTL });
}

export function verifyAccessToken(token: string): AdminPayload {
  return jwt.verify(token, JWT_SECRET) as AdminPayload;
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<string | null> {
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username));

  if (!user) return null;
  if (!(await bcrypt.compare(password, user.passwordHash))) return null;

  return signAccessToken({ sub: user.id, username: user.username });
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const auth = request.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    reply.status(401).send({ error: "Missing Authorization header" });
    return;
  }

  try {
    const payload = verifyAccessToken(auth.slice(7));
    (request as FastifyRequest & { admin: AdminPayload }).admin = payload;
  } catch {
    reply.status(401).send({ error: "Invalid or expired token" });
  }
}
