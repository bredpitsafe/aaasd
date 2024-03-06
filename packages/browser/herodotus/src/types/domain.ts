import type { Assign, Opaque } from '@frontend/common/src/types';
import type { TTrade, TTradeId } from '@frontend/common/src/types/domain/trade';
import type { Nanoseconds } from '@frontend/common/src/types/time';

import { THerodotusAccountV1 } from './v1/account';
import { THerodotusTaskInstrumentV1, THerodotusTaskV1 } from './v1/task';
import { THerodotusConfigInstrumentV1, THerodotusConfigV1 } from './v1/taskConfig';
import { THerodotusAccountV2 } from './v2/account';
import { THerodotusTaskInstrumentV2, THerodotusTaskV2 } from './v2/task';

export enum EHerodotusTaskType {
    Buy = 'Buy',
    Sell = 'Sell',
    BuySell = 'BuySell',
}

export enum EHerodotusTaskRole {
    Unknown = 'Unknown',
    Quote = 'Quote',
    Hedge = 'Hedge',
}

export enum EPriceLimitCurrencyType {
    Reference = 'Reference',
    Quote = 'Quote',
}

export enum EAmountType {
    Base = 'Base',
    Usd = 'Usd',
}

export type THerodotusConfig = THerodotusConfigV1;
export type THerodotusConfigInstrument = THerodotusConfigInstrumentV1;

export enum EHerodotusCommands {
    start = 'start',
    stop = 'stop',
    delete = 'delete',
    archive = 'archive',
    clone = 'clone',
}

export enum EHerodotusTaskStatus {
    started = 'started',
    paused = 'paused',
    finished = 'finished',
    archived = 'archived',
    deleted = 'deleted',
}

export type THerodotusTaskId = Opaque<'HerodotusTask', number>;
export type THerodotusTask = THerodotusTaskV1 | THerodotusTaskV2;
export type THerodotusTaskInstrument = THerodotusTaskInstrumentV1 | THerodotusTaskInstrumentV2;
export type THerodotusAccount = THerodotusAccountV1 | THerodotusAccountV2;

export type THerodotusTrade = Assign<
    TTrade,
    {
        id: TTradeId;
        exchangeTime?: null | Nanoseconds;
    }
>;
