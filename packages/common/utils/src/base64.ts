import type { Opaque } from '@common/types';

export type TBase64<C> = Opaque<'Base64', string> & {
    readonly __content__: C;
};

export function objectToBase64<S>(data: S): TBase64<S> {
    return stringToBase64(JSON.stringify(data)) as unknown as TBase64<S>;
}
export function base64ToObject<R>(data: TBase64<R>): R {
    return JSON.parse(base64ToString(data));
}

/* Converts any string to base64, even those that contain UTF-8 characters inside */
/**
 * @public
 * Converts any string to base64, even those that contain UTF-8 characters inside
 */
export function stringToBase64(str: string): TBase64<string> {
    return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        }),
    ) as TBase64<string>;
}

/**
 * @public
 * Converts any base64 string encoded with `stringToBase64` into a UTF-8 string
 */
export function base64ToString(data: string): string {
    return decodeURIComponent(
        Array.prototype.map
            .call(atob(data), function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(''),
    );
}
