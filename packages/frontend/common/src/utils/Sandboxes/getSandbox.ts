import Sandbox from '@nyariv/sandboxjs';
import hash from 'hash-sum';

import { throwingError } from '../throwingError';

export type TSandboxValidator<S extends object, R> = (s: TSandbox<S, R>) => boolean;
export type TSandbox<S extends object, R> = (scope: S) => R;

const cache = new Map<string, undefined | TSandbox<object, unknown>>();
const sandbox = new Sandbox();

const DEFAULT_BROKEN_SANDBOX = () => throwingError('Incorrect function');

export function getSandbox<S extends object, R>(
    functionBody: string,
    fallbackBody: string,
    validator: TSandboxValidator<S, R>,
): undefined | TSandbox<S, R> {
    const key = hash([functionBody, fallbackBody]);

    if (!cache.has(key)) {
        cache.set(
            key,
            validate(validator, createUnsafeSandbox(functionBody))
                ? createSafeSandbox(functionBody, fallbackBody)
                : undefined,
        );
    }

    return cache.get(key) as undefined | TSandbox<S, R>;
}

function validate<S extends object, R>(
    validator: TSandboxValidator<S, R>,
    sandbox: TSandbox<S, R>,
): boolean {
    try {
        return validator(sandbox);
    } catch (e) {
        return false;
    }
}

function createUnsafeSandbox<S extends object, R>(body: string): TSandbox<S, R> {
    try {
        return createSandbox(body);
    } catch (e) {
        return DEFAULT_BROKEN_SANDBOX as TSandbox<S, R>;
    }
}

function createSafeSandbox(body: string, fallback: string) {
    return createSandbox(safeFunctionBody(body, fallback));
}

// https://github.com/nyariv/SandboxJS/issues/20
function createSandbox<S extends object, R>(body: string): TSandbox<S, R> {
    const parsed = Sandbox.parse(body);
    const context = sandbox.createContext(sandbox.context, parsed);
    const tree = context.tree;
    return (scope) => {
        context.tree = structuredClone(tree);
        return sandbox.executeTree(context, [scope]).result as R;
    };
}

function safeFunctionBody(body: string, fallback: string): string {
    return `try { ${body}; } catch (e) { ${fallback}; }`;
}
