"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPaginationParams = toPaginationParams;
exports.buildPaginatedResult = buildPaginatedResult;
function toPaginationParams({ page, pageSize }) {
    const take = pageSize;
    const skip = (page - 1) * pageSize;
    return { take, skip };
}
function buildPaginatedResult(data, total, pagination) {
    return {
        data,
        total,
        page: pagination.page,
        pageSize: pagination.pageSize,
    };
}
