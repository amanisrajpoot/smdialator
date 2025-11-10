import { N8nClient } from "@scheduler/n8n";
import { env } from "../config/env";

let client: N8nClient | null = null;

export function getN8nClient() {
  if (!env.N8N_BASE_URL || !env.N8N_API_KEY) {
    throw new Error("n8n is not configured. Set N8N_BASE_URL and N8N_API_KEY.");
  }
  if (!client) {
    client = new N8nClient({
      baseUrl: env.N8N_BASE_URL,
      apiKey: env.N8N_API_KEY,
    });
  }
  return client;
}
