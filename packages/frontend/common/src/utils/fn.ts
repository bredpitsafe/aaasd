// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export function noop(...args: any[]): any {
    //
}

function invariant(guard: boolean, message: string, ...args: unknown[]): boolean;
function invariant(
    guard: boolean,
    data: {
        message: string;
        level?: 'error' | 'warn' | 'info';
        args?: unknown[];
    },
): boolean;
function invariant(
    guard: boolean,
    messageOrProps:
        | string
        | {
              message: string;
              level?: 'error' | 'warn' | 'info';
              args?: unknown[];
          },
    ...rest: unknown[]
): boolean {
    if (guard) {
        const mssg = typeof messageOrProps === 'string' ? messageOrProps : messageOrProps.message;
        const level = (typeof messageOrProps === 'object' && messageOrProps.level) || 'error';
        const args = typeof messageOrProps === 'object' ? messageOrProps.args : rest;

        console[level](mssg);
        if (Array.isArray(args) && args.length > 0) {
            console[level](...args);
        }
    }

    return guard;
}

export { invariant };
