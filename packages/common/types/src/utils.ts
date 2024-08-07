import type { TPrimitive } from './primitives/index.ts';

export type Assign<A, B> = Omit<A, keyof B> & B;

export type Nil = null | undefined;

export type Opaque<Type, BaseType> = BaseType & {
    readonly __type__: Type;
    readonly __baseType__: BaseType;
};

export type InterfaceToType<T> = T extends object
    ? {
          [K in keyof T]: Exclude<T[K], Nil> extends object
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                Exclude<T[K], Nil> extends Opaque<any, TPrimitive>
                  ? T[K]
                  : InterfaceToType<T[K]>
              : T[K];
      }
    : T;

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export interface Constructor<T = {}> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NoInfer<T> = [T][T extends any ? 0 : never];

export type ValueOf<T> = T[keyof T];

type IsEmptyObject<T> = T extends {} ? ({} extends T ? true : false) : false;

export type ExcludeEmptyObjects<Union> = Union extends infer U
    ? IsEmptyObject<U> extends true
        ? never
        : U
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Unopaque<O extends Opaque<any, any>> = O extends Opaque<any, infer T> ? T : never;

// https://github.com/sindresorhus/type-fest/blob/main/source/union-to-intersection.d.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I,
) => void
    ? I
    : never;

export type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

export type SomePartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type TupleSplit<
    T,
    N extends number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    O extends readonly any[] = readonly [],
> = O['length'] extends N
    ? [O, T]
    : T extends readonly [infer F, ...infer R]
      ? TupleSplit<readonly [...R], N, readonly [...O, F]>
      : [O, T];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TakeFirst<T extends readonly any[], N extends number> = TupleSplit<T, N>[0];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SkipFirst<T extends readonly any[], N extends number> = TupleSplit<T, N>[1];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TupleSlice<T extends readonly any[], S extends number, E extends number> = SkipFirst<
    TakeFirst<T, E>,
    S
>;

export type KeyByType<T, TKeyType> = NonNullable<
    {
        [K in keyof T]: T[K] extends TKeyType ? K : never;
    }[keyof T]
>;
