import type { TVirtualAccount } from '@frontend/common/src/types/domain/account';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument';

import type { THerodotusTaskInstrumentV1, THerodotusTaskV1 } from '../v1/task';

export type THerodotusTaskV2 = Omit<
    THerodotusTaskV1,
    'amount' | 'buyInstruments' | 'sellInstruments'
> & {
    amount: number | null;
    buyInstruments: THerodotusTaskInstrumentV1[];
    sellInstruments: THerodotusTaskInstrumentV1[];
};

export type THerodotusTaskInstrumentV2 = Omit<
    THerodotusTaskInstrumentV1,
    'name' | 'account' | 'exchange'
> & {
    instrument: TInstrument['name'];
    instrumentId: TInstrument['id'];
    virtualAccount: TVirtualAccount['name'];
};
