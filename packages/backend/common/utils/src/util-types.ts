export type Assign<A, B> = Omit<A, keyof B> & B;

type Nil = null | undefined;
type TPrimitive = string | number | boolean | null | undefined;

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
