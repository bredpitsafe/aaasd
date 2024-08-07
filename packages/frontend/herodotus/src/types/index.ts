import type { TExchange } from '@frontend/common/src/types/domain/exchange';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { ESide } from '@frontend/common/src/types/domain/task';

import type {
    EPriceLimitCurrencyType,
    THerodotusConfigInstrument,
    THerodotusTask,
    THerodotusTaskInstrument,
} from './domain';
import type { THerodotusAccountV1 } from './v1/account';

export enum EHerodotusProtocolVersion {
    V1 = 'V1',
    V2 = 'V2',
}

export enum EHerodotusSettings {
    TradingInstrumentsOnly = 'TradingInstrumentsOnly',
}

export type THerodotusTaskView = Omit<THerodotusTask, 'buyInstruments' | 'sellInstruments'> & {
    robotId: TRobotId;
    hasDraft?: boolean;
    updating?: boolean;
    priceLimitView: THerodotusTask['priceLimit'];
    computationCurrency: string;
    isUSDComputationCurrency: boolean;
    avgPriceUsd: THerodotusTask['avgPrice'];
    avgPriceView: THerodotusTask['avgPrice'];
    realizedPremium: number | null;
    progress: number | null;
    amountView: number | null;
    buyVolume: number | null;
    sellVolume: number | null;
    buyInstruments: THerodotusTaskInstrumentView[] | null;
    sellInstruments: THerodotusTaskInstrumentView[] | null;
    protocol: EHerodotusProtocolVersion;
    dashboardName: string | null;
};

export type THerodotusTaskInstrumentView = THerodotusTaskInstrument & {
    key: string;
    side: ESide.Buy | ESide.Sell;
    fullName: string;
    avgPrice: number | null;
    avgPriceUsd: number | null;
    taskId: THerodotusTask['taskId'];
    taskType: THerodotusTask['taskType'];
    taskStatus: THerodotusTask['status'];
    computationCurrency: THerodotusTaskView['computationCurrency'];
    isUSDComputationCurrency: THerodotusTaskView['isUSDComputationCurrency'];
    volume: number | null;
    protocol: EHerodotusProtocolVersion;
    name: TInstrument['name'];
    account: THerodotusAccountV1['name'];
    exchange: TExchange['name'];
};

export type THerodotusTaskFormDataInstrument = Partial<THerodotusConfigInstrument>;

export type THerodotusTaskFormData = {
    type: ESide;
    assetName: string;
    amount?: number;
    orderSize: number;
    priceLimit?: number;
    currencyType?: EPriceLimitCurrencyType;
    maxPremium?: number;
    aggression: number;
    buyInstruments: THerodotusTaskFormDataInstrument[];
    sellInstruments: THerodotusTaskFormDataInstrument[];
};
