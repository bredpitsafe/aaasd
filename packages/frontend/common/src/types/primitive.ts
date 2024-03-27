import { Opaque } from './index';

export type TPrimitive = string | number | boolean | null | undefined;

// String that represents a fixed point number
export type TFixedPoint = Opaque<'FixedPoint', string>;
