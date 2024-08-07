import type { NanoDate } from '@common/utils';
import type { ReactNode, RefObject } from 'react';

import type {
    TBidAskItem,
    TOrderBookFilter,
    TOrderBookMarketData,
    TOrderBookSnapshot,
    TOrderBookSnapshotParams,
    TOrderBookUpdate,
} from '../../modules/actions/orderBook/defs.ts';
import type { TWithClassname } from '../../types/components';

export enum EBidAsk {
    Bid = 'Bid',
    Ask = 'Ask',
}

export type TDepthOfMarketData = {
    asks: TBidAskItem[];
    bids: TBidAskItem[];
};

export type TOrderBookItem = {
    currentBidAskType: EBidAsk;
    nextBidAskType: EBidAsk;
    price: TBidAskItem['price'];
    currentAmount: TBidAskItem['amount'];
    nextAmount: TBidAskItem['amount'];
    feed?: TBidAskItem['feed'] | [TBidAskItem['feed'], TBidAskItem['feed']];
};

export type TOrderBookTimeStampNanoDate = {
    platformTime: NanoDate;
    exchangeTime?: NanoDate;
    sequenceNo?: number;
};

export type TOrderBookDepthOfMarket = TOrderBookMarketData & TOrderBookTimeStampNanoDate;

export type TOrderBookProps = TWithClassname & {
    current: TOrderBookDepthOfMarket;
    update?: TOrderBookDepthOfMarket;
};

export type TDepthOfMarketProps = {
    gridTemplateColumns: string;
    topItemsCount: number;
    bottomItemsCount: number;
    midPriceRef: RefObject<HTMLDivElement>;
    midToWindowTopDiff: number | undefined;
    onSetMidToWindowTopDiff: (midPosition: number) => void;
    children: ReactNode;
};

export type TOrderBookFormFilter = Omit<TOrderBookFilter, 'btRunNo'> & TOrderBookSnapshotParams;

export type TOrderBookData = {
    snapshot: TOrderBookSnapshot;
    update: TOrderBookUpdate;
    stepRange: { min: number; max: number };
    loading: boolean;
};

export type TOrderBookDataNormalized = {
    snapshot: TOrderBookDepthOfMarket;
    update: TOrderBookDepthOfMarket;
    stepRange: { min: number; max: number };
    loading: boolean;
};
