import type { ISO } from '@common/types';
import type { TExchange } from '@frontend/common/src/types/domain/exchange';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument';
import type { ESide } from '@frontend/common/src/types/domain/task';

import type { EHerodotusTaskRole, EHerodotusTaskStatus, THerodotusTaskId } from '../domain';
import type { THerodotusAccountV1 } from './account';

type THerodotusTaskAmount = Partial<{ Base: number; Usd: number }>;

export type THerodotusTaskV1 = {
    taskId: THerodotusTaskId;
    status: EHerodotusTaskStatus;
    statusMessage: null | string;
    taskType: ESide;
    amount: THerodotusTaskAmount;
    asset: string;
    priceCurrency: string;
    avgPrice: null | number;
    filledAmount: null | number;
    orderSize: number;
    sumPrice: null | number;
    aggression: number;
    priceLimit: null | number;
    priceLimitInQuoteCurrency: null | number;
    maxPremium: null | number;
    buyInstruments: null | THerodotusTaskInstrumentV1[];
    sellInstruments: null | THerodotusTaskInstrumentV1[];
    createdTs: ISO;
    finishedTs: null | ISO;
    lastChangedTs: ISO;
    // Due to a backend bug this field may be fully missing from a task.
    // Type should be reverted to required as soon as the bug is fixed.
    // @see https://bhft-company.atlassian.net/browse/PLT-7312
    dashboardName?: null | string;
    user: null | string;
};

export type THerodotusTaskInstrumentV1 = {
    name: TInstrument['name'];
    account: THerodotusAccountV1['name'];
    exchange: TExchange['name'];
    cumulativeQuote: number; // сколько объёма потратили
    filledAmountBase: number; // сколько набрали в базовом активе
    filledAmountUsd: null | number; // Сколько набрали в USD
    orderPrice: string | null;
    targetPrice: string | null;
    usdRate: number | null; // отношение цены базового актива к USD
    statusMessage: string | null;

    class?: string;
    role?: EHerodotusTaskRole;
    aggressionOverride?: number;
};
