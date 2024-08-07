import type { THerodotusTaskPatchV1 } from '../v1/taskPatch';
import type { THerodotusTaskInstrumentV2 } from './task';

export type THerodotusTaskPatchV2 = Omit<
    THerodotusTaskPatchV1,
    'amount' | 'buyInstruments' | 'sellInstruments'
> & {
    amount: number;
    buyInstruments?: THerodotusTaskInstrumentPatchV2[];
    sellInstruments?: THerodotusTaskInstrumentPatchV2[];
};

export type THerodotusTaskInstrumentPatchV2 = Pick<
    THerodotusTaskInstrumentV2,
    'class' | 'role' | 'instrumentId' | 'aggressionOverride'
> & {
    virtualAccountId: THerodotusTaskInstrumentV2['virtualAccount'];
};
