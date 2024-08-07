import { isNil } from 'lodash-es';

import type {
    THerodotusTaskFormData,
    THerodotusTaskFormDataInstrument,
    THerodotusTaskInstrumentView,
    THerodotusTaskView,
} from '../types';
import { EPriceLimitCurrencyType } from '../types/domain';

export function getFormData(record: THerodotusTaskView): THerodotusTaskFormData {
    return {
        type: record.taskType,
        aggression: record.aggression,
        amount: record.amountView ?? undefined,
        assetName: record.asset,
        orderSize: record.orderSize,
        priceLimit: record.priceLimitView ?? undefined,
        maxPremium: record.maxPremium !== null ? record.maxPremium : undefined,
        buyInstruments: getInstruments(record.buyInstruments),
        sellInstruments: getInstruments(record.sellInstruments),
        currencyType: isNil(record.priceLimitInQuoteCurrency)
            ? EPriceLimitCurrencyType.Reference
            : EPriceLimitCurrencyType.Quote,
    };
}

function getInstruments(
    instrument: THerodotusTaskInstrumentView[] | null,
): THerodotusTaskFormDataInstrument[] {
    return instrument || [];
}
