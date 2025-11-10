"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConnector = void 0;
class BaseConnector {
    platform;
    constructor(platform) {
        this.platform = platform;
    }
    supports(feature) {
        return this.features().includes(feature);
    }
}
exports.BaseConnector = BaseConnector;
