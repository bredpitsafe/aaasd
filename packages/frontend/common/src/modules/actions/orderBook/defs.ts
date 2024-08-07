import type { ISO } from '@common/types';
import { isString } from 'lodash-es';

import type { TBacktestingRun } from '../../../types/domain/backtestings.ts';
import type { TInstrumentId } from '../../../types/domain/instrument.ts';

export type TOrderBookFilter = {
    instrumentId: TInstrumentId;
    platformTime: ISO;
    btRunNo?: TBacktestingRun['btRunNo'];
};

export type TOrderBookSnapshotParams = {
    depth: number;
};

export type TOrderBookUpdateParams = {
    count: number;
};

export type TBidAskItem = {
    price: number;
    amount: number;
    feed?: string;
};

export type TOrderBookTimestamp = {
    platformTime: ISO;
    exchangeTime: ISO | null;
    sequenceNo: number | null;
};

export type TOrderBookMarketData = {
    asks: TBidAskItem[];
    bids: TBidAskItem[];
};

export type TOrderBookSnapshot = TOrderBookMarketData & TOrderBookTimestamp;

export type TOrderBookUpdate = TOrderBookTimestamp & {
    kind: 'reset' | { regular: TOrderBookMarketData };
};

export function isResetOrderBookCommand(kind: TOrderBookUpdate['kind']): kind is 'reset' {
    return isString(kind) && kind.toLowerCase() === 'reset';
}
