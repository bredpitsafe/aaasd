import type { Opaque } from '@common/types';

export type TStringJSON<C extends object> = Opaque<'Json', string> & {
    readonly __content__: C;
};

export function objectToTStringJSON<S extends object>(data: S): TStringJSON<S> {
    return JSON.stringify(data) as unknown as TStringJSON<S>;
}
export function stringJSONToObject<R extends object>(data: TStringJSON<R>): R {
    return JSON.parse(data);
}
