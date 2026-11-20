import { getAuthData } from "~encore/auth";
import bcrypt from "bcryptjs";
import { api, APIError } from "encore.dev/api";
import { db } from "./db";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

function requireAdmin() {
  const authData = getAuthData();

  if (!authData || authData.role !== "ADMIN") {
    throw APIError.permissionDenied(
      "Only administrators can manage users"
    );
  }
}

export const createUser = api(
  { expose: true, auth: true, method: "POST", path: "/users" },
  async (req: CreateUserRequest): Promise<User> => {
    requireAdmin();
if (!req.name?.trim() || !req.email?.trim() || !req.password?.trim()) {
  throw APIError.invalidArgument("Name, email, and password are required");
}
if (
  req.password.length < 8 ||
  !/[A-Z]/.test(req.password) ||
  !/[a-z]/.test(req.password) ||
  !/[0-9]/.test(req.password)
) {
  throw APIError.invalidArgument(
    "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number"
  );
}
   const name = req.name.trim();
const email = req.email.trim().toLowerCase();

const existingUser = await db.queryRow`
  SELECT id FROM users
  WHERE email = ${email}
`;

if (existingUser) {
  throw APIError.alreadyExists("Email is already registered");
}

const id = crypto.randomUUID();
const passwordHash = await bcrypt.hash(req.password, 12);

    return await db.queryRow<User>`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (
        ${id},
        ${name},
        ${email},
        ${passwordHash},
        ${"TEAM_MEMBER"}
      )
      RETURNING id, name, email, role, is_active
    ` as User;
  }
);

export const listUsers = api(
  { expose: true, auth: true, method: "GET", path: "/users" },
  async (): Promise<{ users: User[] }> => {
  requireAdmin();

  const users = await db.queryAll<User>`
      SELECT id, name, email, role, is_active
      FROM users
      ORDER BY created_at DESC
    `;

    return { users };
  }
);
