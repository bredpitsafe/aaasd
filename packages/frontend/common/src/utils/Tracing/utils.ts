import { Binding } from './Children/Binding';

export function consoleWrapper(func: (...args: unknown[]) => void): (...args: unknown[]) => void {
    return (...args: unknown[]): void => {
        const payload = [];
        let prefix = '';

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];

            if (arg instanceof Binding) {
                prefix = `[${arg}]${prefix}`;
            } else {
                payload.push(arg);
            }
        }

        func(prefix, ...payload);
    };
}

export function convertArrayToLogMessage(arr: unknown[]): string {
    return `[length: ${arr.length}]`;
}
