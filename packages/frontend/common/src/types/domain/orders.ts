import type { ISO, Opaque } from '@common/types';
import type { TraceId } from '@common/utils';

import type { TAccountId, TRealAccount, TVirtualAccount, TVirtualAccountId } from './account';
import type { TGate, TGateId } from './gates';
import type { TInstrument, TInstrumentId } from './instrument';
import type { TRobot, TRobotId } from './robots';

export type TOrderId = Opaque<'OrderId', number>;
export type TOrder = {
    id: TOrderId;
};

export enum EOrderStatus {
    Placing = 'Placing',
    Placed = 'Placed',
    Moving = 'Moving',
    Canceling = 'Canceling',
    Canceled = 'Canceled',
    Filled = 'Filled',
    Rejected = 'Rejected',
}

export enum EOrderSide {
    Bid = 'Bid',
    Ask = 'Ask',
}

export enum EOrderTimeInForce {
    Gtc = 'Gtc',
    Session = 'Session',
    Ioc = 'Ioc',
    Fok = 'Fok',
}

export type TActiveOrder = {
    traceId: TraceId;
    orderId: TOrderId;
    virtualAccountId: TVirtualAccountId;
    virtualAccountName: TVirtualAccount['name'];
    accountId: TAccountId;
    accountName: TRealAccount['name'];
    gateId: TGateId;
    gateName: TGate['name'];
    instrumentId: TInstrumentId;
    instrumentName: TInstrument['name'];
    originalAmount: string;
    exchangeTime: ISO | null;
    firstReportTime: ISO;
    platformTime: ISO;
    price: string;
    remainingAmount: string;
    robotId: TRobotId;
    robotName: TRobot['name'];
    side: EOrderSide;
    status: EOrderStatus;
    statusReason: string;
    strategy: string;
    tag: string;
    timeInForce: EOrderTimeInForce;
};
