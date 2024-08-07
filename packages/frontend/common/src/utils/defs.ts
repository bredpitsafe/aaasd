import type { TPrimitive } from '@common/types';
import { isFunction, isNil, isString } from 'lodash-es';
import type { ErrorNotification } from 'rxjs';

export type TTransferableError = {
    toPlainObject(): TPlainErrorObject;
};

export type TTransferableErrorClass = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): Error;

    readonly type: string;

    fromPlainObject(plainObject: TPlainErrorObject): Error;
};

export type TPlainErrorObject = {
    type: string;
    message: string;
    stack?: string;
} & Record<string, unknown>;

export function isTransferableError(
    error: Error | TTransferableError,
): error is TTransferableError {
    return !isNil(error) && 'toPlainObject' in error && isFunction(error.toPlainObject);
}

export function isPlainErrorObject(error?: ErrorNotification['error']): error is TPlainErrorObject {
    return (
        !isNil(error) &&
        'type' in error &&
        isString(error.type) &&
        error.type.trim() !== '' &&
        'message' in error &&
        isString(error.message)
    );
}

export type RecursiveKeyOf<T extends object> = {
    [TKey in keyof T & (string | number)]: RecursiveKeyOfHandleValue<T[TKey], `${TKey}`>;
}[keyof T & (string | number)];

type RecursiveKeyOfInner<T extends object> = {
    [TKey in keyof T & (string | number)]: RecursiveKeyOfHandleValue<T[TKey], `.${TKey}`>;
}[keyof T & (string | number)];

type RecursiveKeyOfHandleValue<T, TPath extends string> = T extends TPrimitive | any[]
    ? TPath
    : T extends object
      ? TPath | `${TPath}${RecursiveKeyOfInner<T>}`
      : TPath;
