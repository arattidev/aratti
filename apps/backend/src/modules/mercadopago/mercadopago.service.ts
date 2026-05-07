import type { AuthContext } from "@aratti/auth";
import type { OAuthExchangeResult } from "@aratti/payments";

import { createAuditLog } from "../../lib/audit";
import { env } from "../../lib/env";
import { HttpError } from "../../lib/errors";
import { assertBusinessAccess } from "../../lib/security/auth";
import { decryptSecret, encryptSecret } from "../../lib/security/cipher";
import { createMercadoPagoProvider } from "./mercadopago.factory";
import { MercadoPagoRepository } from "./mercadopago.repository";
import { buildOAuthState, getOAuthStateTtlMs, verifyOAuthState } from "./mercadopago.state";

const TOKEN_REFRESH_BUFFER_MS = 24 * 60 * 60 * 1000;

interface AuthorizationUrlResult {
  url: string;
  expiresAt: string;
}

interface VerifyConnectionResult {
  connected: boolean;
  mpUserId: string | null;
  liveMode: boolean | null;
  expiresAt: string | null;
  scope: string | null;
}

export class MercadoPagoService {
  constructor(private readonly repository: MercadoPagoRepository) {}

  buildAuthorizationUrl(context: AuthContext, businessId: string): AuthorizationUrlResult {
    assertBusinessAccess(context, businessId);

    if (!env.MERCADO_PAGO_CLIENT_ID || !env.MERCADO_PAGO_OAUTH_REDIRECT_URI) {
      throw new HttpError(
        500,
        "mp_oauth_not_configured",
        "MERCADO_PAGO_CLIENT_ID y MERCADO_PAGO_OAUTH_REDIRECT_URI son obligatorios",
      );
    }

    const provider = createMercadoPagoProvider();
    const state = buildOAuthState({ businessId, userId: context.userId });
    const url = provider.getAuthorizationUrl({
      state,
      redirectUri: env.MERCADO_PAGO_OAUTH_REDIRECT_URI,
    });

    return {
      url,
      expiresAt: new Date(Date.now() + getOAuthStateTtlMs()).toISOString(),
    };
  }

  async handleOAuthCallback(input: { code: string; state: string }): Promise<{ businessId: string; mpUserId: string }> {
    if (!env.MERCADO_PAGO_OAUTH_REDIRECT_URI) {
      throw new HttpError(500, "mp_oauth_not_configured", "MERCADO_PAGO_OAUTH_REDIRECT_URI is required");
    }

    const payload = verifyOAuthState(input.state);
    const provider = createMercadoPagoProvider();

    const tokens = await provider.exchangeCodeForToken({
      code: input.code,
      redirectUri: env.MERCADO_PAGO_OAUTH_REDIRECT_URI,
    });

    await this.persistTokens({
      businessId: payload.businessId,
      connectedByUserId: payload.userId,
      tokens,
      mode: "connect",
    });

    await createAuditLog({
      actorUserId: payload.userId,
      action: "mp_account_connected",
      entityType: "mercado_pago_account",
      entityId: payload.businessId,
      metadata: {
        mpUserId: tokens.mpUserId,
        liveMode: tokens.liveMode,
        scope: tokens.scope,
      },
    });

    return { businessId: payload.businessId, mpUserId: tokens.mpUserId };
  }

  async disconnect(context: AuthContext, businessId: string): Promise<void> {
    assertBusinessAccess(context, businessId);

    const account = await this.repository.findByBusinessId(businessId);
    if (!account) {
      throw new HttpError(404, "mp_account_not_found", "El comercio no tiene Mercado Pago conectado");
    }

    const provider = createMercadoPagoProvider();
    const accessToken = decryptSecret(account.accessTokenCipher);

    try {
      await provider.revokeAuthorization({
        mpUserId: account.mpUserId,
        accessToken,
      });
    } catch {
      // Si MP rechaza la revocación seguimos: el lado nuestro queda revocado.
    }

    await this.repository.softRevoke(businessId);

    await createAuditLog({
      actorUserId: context.userId,
      actorRole: context.role,
      action: "mp_account_disconnected",
      entityType: "mercado_pago_account",
      entityId: businessId,
      metadata: {
        mpUserId: account.mpUserId,
      },
    });
  }

  async verifyConnection(context: AuthContext, businessId: string): Promise<VerifyConnectionResult> {
    assertBusinessAccess(context, businessId);

    const account = await this.repository.findByBusinessId(businessId);

    if (!account) {
      return {
        connected: false,
        mpUserId: null,
        liveMode: null,
        expiresAt: null,
        scope: null,
      };
    }

    return {
      connected: true,
      mpUserId: account.mpUserId,
      liveMode: account.liveMode,
      expiresAt: account.expiresAt.toISOString(),
      scope: account.scope,
    };
  }

  async getValidAccessTokenForBusiness(businessId: string): Promise<{ accessToken: string; mpUserId: string }> {
    const account = await this.repository.findByBusinessId(businessId);
    if (!account) {
      throw new HttpError(409, "business_not_connected_to_mp", "El comercio no tiene Mercado Pago conectado");
    }

    const expiresInMs = account.expiresAt.getTime() - Date.now();

    if (expiresInMs > TOKEN_REFRESH_BUFFER_MS) {
      return {
        accessToken: decryptSecret(account.accessTokenCipher),
        mpUserId: account.mpUserId,
      };
    }

    const provider = createMercadoPagoProvider();
    const refreshed = await provider.refreshAccessToken({
      refreshToken: decryptSecret(account.refreshTokenCipher),
    });

    await this.persistTokens({
      businessId,
      tokens: refreshed,
      mode: "refresh",
    });

    await createAuditLog({
      action: "mp_account_token_refreshed",
      entityType: "mercado_pago_account",
      entityId: businessId,
      metadata: {
        mpUserId: refreshed.mpUserId,
        expiresAt: refreshed.expiresAt.toISOString(),
      },
    });

    return {
      accessToken: refreshed.accessToken,
      mpUserId: refreshed.mpUserId,
    };
  }

  private async persistTokens(input: {
    businessId: string;
    tokens: OAuthExchangeResult;
    connectedByUserId?: string | null;
    mode: "connect" | "refresh";
  }): Promise<void> {
    const accessTokenCipher = encryptSecret(input.tokens.accessToken);
    const refreshTokenCipher = encryptSecret(input.tokens.refreshToken);

    if (input.mode === "connect") {
      await this.repository.upsertByBusinessId({
        businessId: input.businessId,
        mpUserId: input.tokens.mpUserId,
        accessTokenCipher,
        refreshTokenCipher,
        publicKey: input.tokens.publicKey ?? null,
        liveMode: input.tokens.liveMode,
        scope: input.tokens.scope,
        expiresAt: input.tokens.expiresAt,
        connectedByUserId: input.connectedByUserId ?? null,
      });
      return;
    }

    await this.repository.updateTokens(input.businessId, {
      accessTokenCipher,
      refreshTokenCipher,
      expiresAt: input.tokens.expiresAt,
      scope: input.tokens.scope,
      liveMode: input.tokens.liveMode,
    });
  }
}
