import {
  loginBodySchema,
  magicLinkRequestBodySchema,
  magicLinkVerifyBodySchema,
  oauthLoginBodySchema,
  registerBodySchema,
} from "@aratti/api";
import { auth } from "@clerk/nextjs/server";

import { env } from "../../lib/env";
import { HttpError } from "../../lib/errors";
import { apiSuccess } from "../../lib/http";
import { applyApiGuard, parseBody } from "../../lib/security/request";
import { requireAuthContext } from "../../lib/security/auth";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";

const authService = new AuthService(new AuthRepository());

export async function registerController(request: Request) {
  await applyApiGuard("auth.register");
  const body = await parseBody(request, registerBodySchema);
  const data = await authService.register(body);
  return apiSuccess(data, 201);
}

export async function loginController(request: Request) {
  await applyApiGuard("auth.login");
  const body = await parseBody(request, loginBodySchema);

  if (env.AUTH_MODE === "CLERK" && "clerkUserId" in body) {
    const session = await auth();
    if (!session.userId || session.userId !== body.clerkUserId) {
      throw new HttpError(401, "unauthorized", "Invalid Clerk session");
    }
  }

  const data = await authService.login(body);
  return apiSuccess(data, 200);
}

export async function oauthGoogleController(request: Request) {
  await applyApiGuard("auth.oauth.google");
  const body = await parseBody(request, oauthLoginBodySchema);
  const data = await authService.loginWithGoogle(body);
  return apiSuccess(data, 200);
}

export async function requestMagicLinkController(request: Request) {
  await applyApiGuard("auth.magic.request");
  const body = await parseBody(request, magicLinkRequestBodySchema);
  const data = await authService.requestMagicLink(body);
  return apiSuccess(data, 200);
}

export async function verifyMagicLinkController(request: Request) {
  await applyApiGuard("auth.magic.verify");
  const body = await parseBody(request, magicLinkVerifyBodySchema);
  const data = await authService.verifyMagicLink(body);
  return apiSuccess(data, 200);
}

export async function meController() {
  await applyApiGuard("auth.me");
  const context = await requireAuthContext();
  return apiSuccess(context, 200);
}
