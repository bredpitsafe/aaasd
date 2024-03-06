export function isRealtimeChunkRequest(request: { linger: number }): boolean {
    return request.linger > 0;
}
