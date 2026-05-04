const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:3000";

export async function fetchBackend<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH";
    body?: unknown;
    token?: string | null;
  } = {},
): Promise<T> {
  const requestBody = options.body ? JSON.stringify(options.body) : null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: requestBody,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Backend request failed: ${response.status} ${body}`);
  }

  return response.json() as Promise<T>;
}
