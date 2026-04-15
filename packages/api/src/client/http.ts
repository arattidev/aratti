export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export interface HttpClientOptions {
  baseUrl: string;
  getToken?: () => Promise<string | null>;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly getToken: (() => Promise<string | null>) | undefined;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.getToken = options.getToken;
  }

  async request<TResponse>(
    path: string,
    options: {
      method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
      body?: unknown;
      headers?: Record<string, string>;
      signal?: AbortSignal;
    } = {},
  ): Promise<TResponse> {
    const token = this.getToken ? await this.getToken() : null;

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : null,
      signal: options.signal ?? null,
    });

    const text = await response.text();
    const data = text ? safeJson(text) : null;

    if (!response.ok) {
      throw new ApiError(
        typeof data === "object" && data && "message" in data ? String((data as { message: unknown }).message) : "Request failed",
        response.status,
        data,
      );
    }

    return data as TResponse;
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
