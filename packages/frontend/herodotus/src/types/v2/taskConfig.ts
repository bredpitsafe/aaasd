import type { TVirtualAccount } from '@frontend/common/src/types/domain/account';
import type { TAsset } from '@frontend/common/src/types/domain/asset';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument';

import type { THerodotusConfigInstrumentV1, THerodotusConfigV1 } from '../v1/taskConfig';

export type THerodotusConfigV2 = Omit<
    THerodotusConfigV1,
    'asset' | 'amount' | 'buyInstruments' | 'sellInstruments'
> & {
    // Backend supports both number & string as valid values for `assetId`.
    // If a string is provided, it'll be automagically matched with correct ID.
    assetId: TAsset['id'] | TAsset['name'];
    amount: number;
    buyInstruments?: THerodotusConfigInstrumentV2[];
    sellInstruments?: THerodotusConfigInstrumentV2[];
};

export type THerodotusConfigInstrumentV2 = Omit<
    THerodotusConfigInstrumentV1,
    'name' | 'exchange' | 'account'
> & {
    // Backend supports both number & string as valid values for `instrumentId` & `virtualAccountId`.
    // If a string is provided, it'll be automagically matched with correct ID.
    instrumentId: TInstrument['id'] | TInstrument['name'];
    virtualAccountId: TVirtualAccount['id'] | TVirtualAccount['name'];
};
