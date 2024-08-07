import type { ISO, Opaque } from '@common/types';

import type { EOrderSide } from './orders';

export enum ETradeRole {
    Maker = 'Maker',
    Taker = 'Taker',
}

export type TTradeId = Opaque<'TradeId', number>;
export type TTrade = {
    id: TTradeId;
    platformTime: ISO;
    exchangeTime: ISO;
    exchange: string;
    instrument: string;
    baseAsset: string;
    quoteAsset: string;
    volumeAsset: string;
    volumeAmount: string;
    feeAsset: string;
    type: string;
    gate: string;
    instance: string;
    account: string;
    virtualAccount: string;
    exchangeTradeId: string;
    orderTag: string;
    strategy: string;
    robot: string;
    robotType: string;
    orderId: number;
    exchangeOrderId: string;
    price: string;
    baseAmount: string;
    quoteAmount: string;
    feeAmount: string;
    side: EOrderSide;
    role: ETradeRole;
    isFeeEvaluated: number;
};
