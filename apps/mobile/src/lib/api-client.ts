import { HttpClient, MobileApiClient } from "@aratti/api";

import { API_BASE_URL } from "./constants";
import { readAuthToken } from "./secure-store";

const httpClient = new HttpClient({
  baseUrl: API_BASE_URL,
  getToken: async () => readAuthToken(),
});

export const mobileApi = new MobileApiClient(httpClient);
