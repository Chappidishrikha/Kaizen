import { getAuthData } from "~encore/auth";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { api, APIError, Gateway, Header } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { jwtVerify } from "jose";
import { secret } from "encore.dev/config";
import { db } from "./db";

const authSecret = secret("AuthSecret");
const adminSetupKey = secret("AdminSetupKey");

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: boolean;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const login = api(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req: LoginRequest): Promise<LoginResponse> => {
    const email = req.email?.trim().toLowerCase();

    if (!email || !req.password) {
      throw APIError.invalidArgument("Email and password are required");
    }

    const user = await db.queryRow<LoginUser>`
      SELECT id, name, email, password_hash, role, is_active
      FROM users
      WHERE email = ${email}
    `;

    if (!user || !user.is_active) {
      throw APIError.unauthenticated("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(
      req.password,
      user.password_hash
    );

    if (!passwordMatches) {
      throw APIError.unauthenticated("Invalid email or password");
    }

    const token = await new SignJWT({ role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode(authSecret()));

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
);

interface SetupAdminRequest {
  setupKey: string;
  name: string;
  email: string;
  password: string;
}

export const setupAdmin = api(
  { expose: true, method: "POST", path: "/auth/setup-admin" },
  async (req: SetupAdminRequest) => {
    if (!req.setupKey || req.setupKey !== adminSetupKey()) {
      throw APIError.unauthenticated("Invalid setup key");
    }

    const adminCount = await db.queryRow<{ count: number }>`
      SELECT COUNT(*)::int AS count
      FROM users
      WHERE role = 'ADMIN'
    `;

    if (adminCount && adminCount.count > 0) {
      throw APIError.failedPrecondition(
        "An administrator account already exists"
      );
    }

    if (!req.name?.trim() || !req.email?.trim() || !req.password) {
      throw APIError.invalidArgument(
        "Name, email, and password are required"
      );
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
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser) {
      throw APIError.alreadyExists("Email is already registered");
    }

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(req.password, 12);

    await db.exec`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (
        ${id},
        ${name},
        ${email},
        ${passwordHash},
        ${"ADMIN"}
      )
    `;

    return {
      message: "Administrator account created successfully",
      user: {
        id,
        name,
        email,
        role: "ADMIN",
      },
    };
  }
);
interface AuthParams {
  authorization: Header<"Authorization">;
}

interface AuthData {
  userID: string;
  role: string;
}

export const auth = authHandler<AuthParams, AuthData>(
  async (params) => {
    const header = params.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw APIError.unauthenticated("Missing or invalid authorization header");
    }

    const token = header.slice(7);

    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(authSecret()),
        { algorithms: ["HS256"] }
      );

      if (
        !payload.sub ||
        (payload.role !== "ADMIN" && payload.role !== "TEAM_MEMBER")
      ) {
        throw new Error("Invalid token payload");
      }

      return {
        userID: payload.sub,
        role: payload.role,
      };
    } catch {
      throw APIError.unauthenticated("Invalid or expired token");
    }
  }
);

export const gateway = new Gateway({
  authHandler: auth,
});
interface MeResponse {
  userID: string;
  role: string;
}
export const me = api(
  { expose: true, auth: true, method: "GET", path: "/auth/me" },
  async (): Promise<MeResponse> => {
    const user = getAuthData()!;

    return {
      userID: user.userID,
      role: user.role,
    };
  }
);