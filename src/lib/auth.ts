import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "swan_super_secret_jwt_key_2026_dev_prod"
);

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  [key: string]: unknown;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Retrieves the current authenticated user by checking:
 * 1. The HTTP-only "swan_auth_token" cookie
 * 2. Or the "Authorization: Bearer <token>" header
 */
export async function getAuthSession(req?: Request | NextRequest) {
  let token: string | undefined;

  // 1. Check Authorization header
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  // 2. Check Cookie if not in header
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("swan_auth_token")?.value;
    } catch {
      // In non-server-action or edge contexts where cookies() is not available
    }
  }

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  return user;
}

export function unauthorizedResponse(message = "Unauthorized. Please log in.") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden. Admin privileges required.") {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}
