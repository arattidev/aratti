import { loginBodySchema } from "@aratti/api";

import { HttpError } from "../../lib/errors";
import { AuthRepository } from "./auth.repository";

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(input: unknown) {
    const payload = loginBodySchema.parse(input);

    if (!payload.clerkUserId) {
      throw new HttpError(401, "unauthorized", "Missing Clerk user id");
    }

    const user = await this.authRepository.upsertUser({
      clerkUserId: payload.clerkUserId,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      avatarUrl: payload.avatarUrl,
      locale: payload.locale,
    });

    return {
      userId: user.id,
      role: user.role,
      accountStatus: user.accountStatus,
    };
  }
}
