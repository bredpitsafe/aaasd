import type { TPrimitive } from '@common/types';
import { isPrimitive } from '@common/utils';
import { isEmpty, isNil, isObject, isString, mapValues } from 'lodash-es';

import { SOCKET_STAR_NAME } from '../../modules/socketList/defs.ts';
import { Binding } from './Children/Binding';

export function logWrapper(
    func: (prefix: string, message: string, payload?: object) => void,
): (...args: unknown[]) => void {
    return (...args: unknown[]): void => {
        let payload = {};
        const prefixes: string[] = [];
        const messages: TPrimitive[] = [];

        const processArgument = (arg: unknown) => {
            if (arg instanceof Binding) {
                prefixes.push(arg.toString());
            } else if (isPrimitive(arg)) {
                messages.push(arg);
            } else if (Array.isArray(arg)) {
                arg.forEach(processArgument);
            } else if (arg && isObject(arg)) {
                payload = { ...payload, ...arg };
            } else {
                throw new Error(`Invalid log argument: ${arg}`);
            }
        };
        processArgument(args);
        const prefixesStr = prefixes.map((item) => `[${item}]`).join('');
        const messagesStr = messages.join(',');

        if (isRecursiveLog(prefixesStr, payload)) {
            return;
        }

        if (isEmpty(payload)) {
            func(prefixesStr, messagesStr);
        } else {
            func(prefixesStr, messagesStr, payload);
        }
    };
}

export function convertArrayToLogMessage(arr: unknown[]): string {
    return `[length: ${arr.length}]`;
}

export function convertObjectToLogMessage(obj: unknown, nested?: boolean): unknown {
    if (isNil(obj)) {
        return 'nil';
    }
    if (isPrimitive(obj)) {
        return typeof obj;
    }
    if (Array.isArray(obj)) {
        return `array:${obj.length}`;
    }
    if (isObject(obj)) {
        if (nested) {
            return 'object';
        }
        return mapValues(obj, (v) => convertObjectToLogMessage(v, true));
    }

    return 'unknown';
}

// TODO: Dangerous method should be removed
function isRecursiveLog(prefixesStr: string, payload: object): boolean {
    return (
        ('socketURL' in payload &&
            isString(payload.socketURL) &&
            payload.socketURL.includes(SOCKET_STAR_NAME)) ||
        prefixesStr.includes(SOCKET_STAR_NAME)
    );
}
