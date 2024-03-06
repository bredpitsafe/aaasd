// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertNever(value?: never): never {
    throw new Error(`assertNever invocation`);
}

export function assert(condition: boolean, message?: string): asserts condition {
    if (!condition) {
        throw new Error(message || 'assertion failed');
    }
}
