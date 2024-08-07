import type { UnionToIntersection, ValueOf } from '@common/types';
import type { CalendarDate } from '@common/types';
import type {
    TEncodedTypicalRouteParams,
    TTypicalRouterData,
    TTypicalStageRouteParams,
} from '@frontend/common/src/modules/router/defs';
import { ETypicalRoute, ETypicalSearchParams } from '@frontend/common/src/modules/router/defs';
import type { TAsset } from '@frontend/common/src/types/domain/asset';
import type { TBacktestingRunId } from '@frontend/common/src/types/domain/backtestings';
import type { TExchange } from '@frontend/common/src/types/domain/exchange';
import type { TInstrumentId } from '@frontend/common/src/types/domain/instrument';
import type { TStrategyName } from '@frontend/common/src/types/domain/ownTrades';
import type { IModuleRouter } from '@frontend/common/src/types/router';

export const ETradingStatsRoutes = <const>{
    ...ETypicalRoute,
    Daily: 'socket.daily',
    Monthly: 'socket.monthly',
};
export type TTradingStatsRoute = `${ValueOf<typeof ETradingStatsRoutes>}`;

export const ETradingStatsRouteParams = <const>{
    ...ETypicalSearchParams,
    Date: 'date',
    From: 'from',
    To: 'to',
    BacktestingId: 'backtestingId',
    BaseAssetsInclude: 'baseAssetsInclude',
    VolumeAssetsInclude: 'volumeAssetsInclude',
    AnyAssetsInclude: 'anyAssetsInclude',
    InstrumentsInclude: 'instrumentsInclude',
    ExchangesInclude: 'exchangesInclude',
    StrategiesInclude: 'strategiesInclude',
    BaseAssetsExclude: 'baseAssetsExclude',
    VolumeAssetsExclude: 'volumeAssetsExclude',
    AnyAssetsExclude: 'anyAssetsExclude',
    InstrumentsExclude: 'instrumentsExclude',
    ExchangesExclude: 'exchangesExclude',
    StrategiesExclude: 'strategiesExclude',
};

type TTradingStatsCommonRouteParams = TTypicalStageRouteParams & {
    [ETradingStatsRouteParams.BacktestingId]?: TBacktestingRunId;
    [ETradingStatsRouteParams.BaseAssetsInclude]?: TAsset['id'][];
    [ETradingStatsRouteParams.VolumeAssetsInclude]?: TAsset['id'][];
    [ETradingStatsRouteParams.AnyAssetsInclude]?: TAsset['id'][];
    [ETradingStatsRouteParams.InstrumentsInclude]?: TInstrumentId[];
    [ETradingStatsRouteParams.ExchangesInclude]?: TExchange['name'][];
    [ETradingStatsRouteParams.StrategiesInclude]?: TStrategyName[];
    [ETradingStatsRouteParams.BaseAssetsExclude]?: TAsset['id'][];
    [ETradingStatsRouteParams.VolumeAssetsExclude]?: TAsset['id'][];
    [ETradingStatsRouteParams.AnyAssetsExclude]?: TAsset['id'][];
    [ETradingStatsRouteParams.InstrumentsExclude]?: TInstrumentId[];
    [ETradingStatsRouteParams.ExchangesExclude]?: TExchange['name'][];
    [ETradingStatsRouteParams.StrategiesExclude]?: TStrategyName[];
};

export type TTradingStatsDailyRouteParams = TTradingStatsCommonRouteParams & {
    [ETradingStatsRouteParams.Date]?: CalendarDate;
};

export type TTradingStatsMonthlyRouteParams = TTradingStatsCommonRouteParams & {
    [ETradingStatsRouteParams.From]?: CalendarDate;
    [ETradingStatsRouteParams.To]?: CalendarDate;
};

type TTradingStatsRouterData = TTypicalRouterData & {
    [ETradingStatsRoutes.Daily]: TTradingStatsDailyRouteParams;
    [ETradingStatsRoutes.Monthly]: TTradingStatsMonthlyRouteParams;
};

export type TOneOfTradingStatsRouteParams = ValueOf<TTradingStatsRouterData>;
export type TAllTradingStatsRouteParams = UnionToIntersection<TOneOfTradingStatsRouteParams>;

type TPossibleStringArray = string | string[];

export type TEncodedTradingStatsRouteParams = TEncodedTypicalRouteParams & {
    [ETradingStatsRouteParams.Date]?: string;
    [ETradingStatsRouteParams.From]?: string;
    [ETradingStatsRouteParams.To]?: string;
    [ETradingStatsRouteParams.BacktestingId]?: string;
    [ETradingStatsRouteParams.BaseAssetsInclude]?: TPossibleStringArray;
    [ETradingStatsRouteParams.VolumeAssetsInclude]?: TPossibleStringArray;
    [ETradingStatsRouteParams.AnyAssetsInclude]?: TPossibleStringArray;
    [ETradingStatsRouteParams.InstrumentsInclude]?: TPossibleStringArray;
    [ETradingStatsRouteParams.ExchangesInclude]?: TPossibleStringArray;
    [ETradingStatsRouteParams.StrategiesInclude]?: TPossibleStringArray;
    [ETradingStatsRouteParams.BaseAssetsExclude]?: TPossibleStringArray;
    [ETradingStatsRouteParams.VolumeAssetsExclude]?: TPossibleStringArray;
    [ETradingStatsRouteParams.AnyAssetsExclude]?: TPossibleStringArray;
    [ETradingStatsRouteParams.InstrumentsExclude]?: TPossibleStringArray;
    [ETradingStatsRouteParams.ExchangesExclude]?: TPossibleStringArray;
    [ETradingStatsRouteParams.StrategiesExclude]?: TPossibleStringArray;
};

export type IModuleTradingStatsRouter = IModuleRouter<TTradingStatsRouterData>;
