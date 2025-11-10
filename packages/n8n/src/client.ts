import axios, { type AxiosInstance } from "axios";
import { z } from "zod";

const workflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  tags: z.array(z.string()).optional(),
});

export type N8nWorkflow = z.infer<typeof workflowSchema>;

export interface N8nClientOptions {
  baseUrl: string;
  apiKey: string;
}

export class N8nClient {
  private readonly http: AxiosInstance;

  constructor(options: N8nClientOptions) {
    this.http = axios.create({
      baseURL: options.baseUrl.replace(/\/$/, ""),
      headers: {
        "X-N8N-API-KEY": options.apiKey,
      },
    });
  }

  async listWorkflows(): Promise<N8nWorkflow[]> {
    const response = await this.http.get("/workflows");
    const workflows = z.array(workflowSchema).parse(response.data.data ?? response.data);
    return workflows;
  }

  async triggerWorkflow(workflowId: string, payload: Record<string, unknown>) {
    await this.http.post(`/workflows/${workflowId}/run`, payload);
  }

  async createOrUpdateWebhook(
    name: string,
    targetUrl: string,
    event: string,
    metadata?: Record<string, unknown>
  ) {
    await this.http.post("/webhook", {
      name,
      targetUrl,
      event,
      metadata,
    });
  }
}
