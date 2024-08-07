import type { THerodotusConfig, THerodotusTaskId } from '../domain';
import type { THerodotusTaskInstrumentV1 } from './task';

export type THerodotusTaskPatchV1 = { taskId: THerodotusTaskId } & Partial<
    Pick<THerodotusConfig, 'amount' | 'orderSize' | 'priceLimit' | 'aggression' | 'maxPremium'> & {
        buyInstruments?: THerodotusTaskInstrumentPatchV1[];
        sellInstruments?: THerodotusTaskInstrumentPatchV1[];
    }
>;

export type THerodotusTaskInstrumentPatchV1 = Pick<
    THerodotusTaskInstrumentV1,
    'class' | 'role' | 'name' | 'account' | 'exchange' | 'aggressionOverride'
>;
