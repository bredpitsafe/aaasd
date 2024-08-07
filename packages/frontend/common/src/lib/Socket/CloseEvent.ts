/*
 * Apply CloseEvent polyfill for Node environment since `Socket` client may be used in Node,
 * but Node doesn't have it in current WebSocket spec.
 *
 * @see https://github.com/nodejs/node/issues/50275
 * */
class CloseEventPolyfill extends Event implements CloseEvent {
    readonly code: number;
    readonly reason: string;
    readonly wasClean: boolean;
    constructor(type: string, eventInitDict?: CloseEventInit) {
        super(type);
        this.code = eventInitDict?.code ?? -1;
        this.reason = eventInitDict?.reason ?? '';
        this.wasClean = eventInitDict?.wasClean ?? false;
    }
}

CloseEvent = typeof window !== 'undefined' ? window.CloseEvent : CloseEventPolyfill;
