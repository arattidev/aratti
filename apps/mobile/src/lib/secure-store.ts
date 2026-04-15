import * as SecureStore from "expo-secure-store";

const AUTH_TOKEN_KEY = "aratti-auth-token";

export async function saveAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token, {
    keychainService: AUTH_TOKEN_KEY,
  });
}

export async function readAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY, {
    keychainService: AUTH_TOKEN_KEY,
  });
}

export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY, {
    keychainService: AUTH_TOKEN_KEY,
  });
}
