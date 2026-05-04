import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import {
  loginBodySchema,
  magicLinkRequestBodySchema,
  magicLinkVerifyBodySchema,
  oauthLoginBodySchema,
  registerBodySchema,
} from "@aratti/api";
import type { AuthContext } from "@aratti/auth";

import { HttpError } from "../../lib/errors";
import { createAccessToken } from "../../lib/security/token";
import { AuthRepository } from "./auth.repository";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }

  const incoming = scryptSync(password, salt, 64);
  const existing = Buffer.from(hash, "hex");
  return incoming.length === existing.length && timingSafeEqual(incoming, existing);
}

function hashMagicToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(input: unknown) {
    const payload = registerBodySchema.parse(input);

    const existing = await this.authRepository.findUserByEmail(payload.email);
    if (existing) {
      throw new HttpError(409, "email_exists", "Email already registered");
    }

    const user = await this.authRepository.createBusinessUser({
      email: payload.email,
      passwordHash: hashPassword(payload.password),
      authProvider: "PASSWORD",
      ...(payload.name ? { firstName: payload.name } : {}),
      ...(payload.businessName ? { businessName: payload.businessName } : {}),
    });

    const context = await this.buildAuthContext(user.id);
    const session = createAccessToken(context);

    return {
      userId: user.id,
      role: user.role,
      accountStatus: user.accountStatus,
      accessToken: session.token,
      expiresAt: session.expiresAt,
    };
  }

  async login(input: unknown) {
    const payload = loginBodySchema.parse(input);

    if ("clerkUserId" in payload) {
      const user = await this.authRepository.upsertLegacyClerkUser({
        clerkUserId: payload.clerkUserId,
        email: payload.email,
        locale: payload.locale,
        ...(payload.firstName ? { firstName: payload.firstName } : {}),
        ...(payload.lastName ? { lastName: payload.lastName } : {}),
        ...(payload.avatarUrl ? { avatarUrl: payload.avatarUrl } : {}),
      });

      const context = await this.buildAuthContext(user.id);
      const session = createAccessToken(context);

      return {
        userId: user.id,
        role: user.role,
        accountStatus: user.accountStatus,
        accessToken: session.token,
        expiresAt: session.expiresAt,
      };
    }

    if ("magicToken" in payload) {
      const user = await this.authRepository.consumeMagicLinkToken({
        email: payload.email,
        tokenHash: hashMagicToken(payload.magicToken),
      });

      if (!user) {
        throw new HttpError(401, "invalid_magic_link", "Magic link is invalid or expired");
      }

      await this.authRepository.updateUserLastSeen(user.id);
      const context = await this.buildAuthContext(user.id);
      const session = createAccessToken(context);

      return {
        userId: user.id,
        role: user.role,
        accountStatus: user.accountStatus,
        accessToken: session.token,
        expiresAt: session.expiresAt,
      };
    }

    const user = await this.authRepository.findUserByEmail(payload.email);
    if (!user || !user.passwordHash || !verifyPassword(payload.password, user.passwordHash)) {
      throw new HttpError(401, "invalid_credentials", "Invalid email or password");
    }

    await this.authRepository.updateUserLastSeen(user.id);
    const context = await this.buildAuthContext(user.id);
    const session = createAccessToken(context);

    return {
      userId: user.id,
      role: user.role,
      accountStatus: user.accountStatus,
      accessToken: session.token,
      expiresAt: session.expiresAt,
    };
  }

  async loginWithGoogle(input: unknown) {
    const payload = oauthLoginBodySchema.parse(input);

    const user = await this.authRepository.upsertOAuthUser({
      email: payload.email,
      authProvider: "GOOGLE",
      ...(payload.name ? { firstName: payload.name } : {}),
    });

    await this.authRepository.ensureBusinessMembershipForUser({
      userId: user.id,
      ...(payload.name ? { businessName: `${payload.name} Business` } : {}),
    });

    const refreshedUser = await this.authRepository.findUserByEmail(payload.email);
    if (!refreshedUser) {
      throw new HttpError(500, "user_creation_failed", "Unable to complete OAuth login");
    }

    const context = await this.buildAuthContext(refreshedUser.id);
    const session = createAccessToken(context);

    return {
      userId: refreshedUser.id,
      role: refreshedUser.role,
      accountStatus: refreshedUser.accountStatus,
      accessToken: session.token,
      expiresAt: session.expiresAt,
    };
  }

  async requestMagicLink(input: unknown) {
    const payload = magicLinkRequestBodySchema.parse(input);
    let user = await this.authRepository.findUserByEmail(payload.email);

    if (!user) {
      user = await this.authRepository.createBusinessUser({
        email: payload.email,
        authProvider: "MAGIC_LINK",
      });
    }

    const token = randomBytes(24).toString("hex");
    await this.authRepository.createMagicLinkToken({
      userId: user.id,
      email: payload.email,
      tokenHash: hashMagicToken(token),
      expiresAt: new Date(Date.now() + 1000 * 60 * 20),
    });

    return {
      email: payload.email,
      token,
      expiresInMinutes: 20,
    };
  }

  async verifyMagicLink(input: unknown) {
    const payload = magicLinkVerifyBodySchema.parse(input);
    const user = await this.authRepository.consumeMagicLinkToken({
      email: payload.email,
      tokenHash: hashMagicToken(payload.token),
    });

    if (!user) {
      throw new HttpError(401, "invalid_magic_link", "Magic link is invalid or expired");
    }

    await this.authRepository.updateUserLastSeen(user.id);
    const context = await this.buildAuthContext(user.id);
    const session = createAccessToken(context);

    return {
      userId: user.id,
      role: user.role,
      accountStatus: user.accountStatus,
      accessToken: session.token,
      expiresAt: session.expiresAt,
    };
  }

  private async buildAuthContext(userId: string): Promise<AuthContext> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new HttpError(404, "user_not_found", "User not found");
    }

    const businessIds = await this.authRepository.findBusinessIdsForUser(userId);

    return {
      userId: user.id,
      role: user.role,
      email: user.email,
      businessIds,
    };
  }
}
