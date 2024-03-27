export type Either<V, Err extends Error = Error> = [Err, null] | [null, V];

export const left = <Err extends Error>(err: Err): Either<never, Err> => [err, null];
export const right = <T>(value: T): Either<T> => [null, value];

export const isLeft = <Err extends Error>(either: Either<unknown, Err>): either is [Err, null] =>
    either[0] !== null;

export const isRight = <T>(either: Either<T>): either is [null, T] => either[0] === null;

export const getLeft = <Err extends Error>(either: [Err, null]): Err => either[0];

export const getRight = <T>(either: [null, T]): T => either[1];
