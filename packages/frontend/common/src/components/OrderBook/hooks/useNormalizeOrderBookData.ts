import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import type { TBidAskItem, TOrderBookMarketData } from '../../../modules/actions/orderBook/defs.ts';
import { isResetOrderBookCommand } from '../../../modules/actions/orderBook/defs.ts';
import type { TOrderBookData, TOrderBookDataNormalized } from '../defs';
import { getNanoDate, isError } from '../utils';

export function useNormalizeOrderBookData(
    data: undefined | Error | TOrderBookData,
): undefined | Error | TOrderBookDataNormalized {
    return useMemo(() => {
        if (isNil(data) || isError(data)) {
            return data;
        }
        const { snapshot, update, stepRange, loading } = data as TOrderBookData;

        const marketData: TOrderBookMarketData = isResetOrderBookCommand(update.kind)
            ? {
                  asks: snapshot.asks.map(mapReset),
                  bids: snapshot.bids.map(mapReset),
              }
            : update.kind.regular;

        return {
            snapshot: {
                ...snapshot,
                platformTime: getNanoDate(snapshot.platformTime),
                exchangeTime: getNanoDate(snapshot.exchangeTime),
                sequenceNo: snapshot.sequenceNo ?? null,
            },
            update: {
                ...marketData,
                platformTime: getNanoDate(update.platformTime),
                exchangeTime: getNanoDate(update.exchangeTime),
                sequenceNo: update.sequenceNo ?? null,
            },
            stepRange,
            loading,
        } as TOrderBookDataNormalized;
    }, [data]);
}

function mapReset({ price }: TBidAskItem) {
    return { price, amount: 0 };
}
