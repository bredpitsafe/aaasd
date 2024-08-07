import type { Opaque } from '../utils.ts';

export type TPrimitive = string | number | boolean | null | undefined;

// String that represents a fixed point number
export type TFixedPoint = Opaque<'FixedPoint', string>;

export type TUserName = Opaque<'TUserName', string>;
