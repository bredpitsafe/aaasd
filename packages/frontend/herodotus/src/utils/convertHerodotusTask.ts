import type { THerodotusConfigInstrumentV1, THerodotusConfigV1 } from '../types/v1/taskConfig';
import type { THerodotusConfigInstrumentV2, THerodotusConfigV2 } from '../types/v2/taskConfig';

export const convertHerodotusTaskV1ToV2 = (task: THerodotusConfigV1): THerodotusConfigV2 => {
    const { asset, amount, buyInstruments, sellInstruments, ...rest } = task;
    return {
        ...rest,
        assetId: asset,
        amount: amount.Base ?? amount.Usd ?? 0,
        buyInstruments: buyInstruments?.map(convertHerodotusInstrumentV1ToV2),
        sellInstruments: sellInstruments?.map(convertHerodotusInstrumentV1ToV2),
    };
};

const convertHerodotusInstrumentV1ToV2 = (
    inst: THerodotusConfigInstrumentV1,
): THerodotusConfigInstrumentV2 => {
    const { name, account: virtualAccountId, exchange, ...rest } = inst;
    return {
        instrumentId: `${name}|${exchange}`,
        virtualAccountId,
        ...rest,
    };
};
