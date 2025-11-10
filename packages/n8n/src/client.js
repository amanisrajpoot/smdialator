"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nClient = void 0;
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const workflowSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    active: zod_1.z.boolean(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
class N8nClient {
    http;
    constructor(options) {
        this.http = axios_1.default.create({
            baseURL: options.baseUrl.replace(/\/$/, ""),
            headers: {
                "X-N8N-API-KEY": options.apiKey,
            },
        });
    }
    async listWorkflows() {
        const response = await this.http.get("/workflows");
        const workflows = zod_1.z.array(workflowSchema).parse(response.data.data ?? response.data);
        return workflows;
    }
    async triggerWorkflow(workflowId, payload) {
        await this.http.post(`/workflows/${workflowId}/run`, payload);
    }
    async createOrUpdateWebhook(name, targetUrl, event, metadata) {
        await this.http.post("/webhook", {
            name,
            targetUrl,
            event,
            metadata,
        });
    }
}
exports.N8nClient = N8nClient;
