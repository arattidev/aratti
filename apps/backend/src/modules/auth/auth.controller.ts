import { apiSuccess } from "../../lib/http";
import { applyApiGuard, parseBody } from "../../lib/security/request";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { loginBodySchema } from "@aratti/api";
import { auth } from "@clerk/nextjs/server";
import { HttpError } from "../../lib/errors";

const authService = new AuthService(new AuthRepository());

export async function loginController(request: Request) {
  await applyApiGuard("auth.login");
  const body = await parseBody(request, loginBodySchema);

  if (process.env.NODE_ENV !== "development") {
    const session = await auth();
    if (!session.userId || session.userId !== body.clerkUserId) {
      throw new HttpError(401, "unauthorized", "Invalid Clerk session");
    }
  }

  const data = await authService.login(body);
  return apiSuccess(data, 200);
}
