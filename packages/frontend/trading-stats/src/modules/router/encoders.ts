import type { CalendarDate } from '@common/types';
import { extractValidNumber } from '@common/utils/src/extract.ts';
import {
    decodeTypicalParams,
    encodeTypicalParams,
} from '@frontend/common/src/modules/router/encoders';
import type { TBacktestingRunId } from '@frontend/common/src/types/domain/backtestings';
import { isArray, isNil } from 'lodash-es';

import type {
    TAllTradingStatsRouteParams,
    TEncodedTradingStatsRouteParams,
    TOneOfTradingStatsRouteParams,
} from './defs';
import { ETradingStatsRouteParams } from './defs';

export function decodeParams(
    params: TEncodedTradingStatsRouteParams,
): TOneOfTradingStatsRouteParams {
    return {
        ...decodeTypicalParams(params),
        [ETradingStatsRouteParams.Date]: params.date as undefined | CalendarDate,
        [ETradingStatsRouteParams.From]: params.from as undefined | CalendarDate,
        [ETradingStatsRouteParams.To]: params.to as undefined | CalendarDate,
        [ETradingStatsRouteParams.BacktestingId]: extractValidNumber(params.backtestingId) as
            | undefined
            | TBacktestingRunId,
        [ETradingStatsRouteParams.BaseAssetsInclude]: mapToNumberArray(params.baseAssetsInclude),
        [ETradingStatsRouteParams.VolumeAssetsInclude]: mapToNumberArray(
            params.volumeAssetsInclude,
        ),
        [ETradingStatsRouteParams.AnyAssetsInclude]: mapToNumberArray(params.anyAssetsInclude),
        [ETradingStatsRouteParams.InstrumentsInclude]: mapToNumberArray(params.instrumentsInclude),
        [ETradingStatsRouteParams.ExchangesInclude]: mapToStringArray(params.exchangesInclude),
        [ETradingStatsRouteParams.StrategiesInclude]: mapToStringArray(params.strategiesInclude),
        [ETradingStatsRouteParams.BaseAssetsExclude]: mapToNumberArray(params.baseAssetsExclude),
        [ETradingStatsRouteParams.VolumeAssetsExclude]: mapToNumberArray(
            params.volumeAssetsExclude,
        ),
        [ETradingStatsRouteParams.AnyAssetsExclude]: mapToNumberArray(params.anyAssetsExclude),
        [ETradingStatsRouteParams.InstrumentsExclude]: mapToNumberArray(params.instrumentsExclude),
        [ETradingStatsRouteParams.ExchangesExclude]: mapToStringArray(params.exchangesExclude),
        [ETradingStatsRouteParams.StrategiesExclude]: mapToStringArray(params.strategiesExclude),
    } as TOneOfTradingStatsRouteParams;
}

export function encodeParams(params: TAllTradingStatsRouteParams): TEncodedTradingStatsRouteParams {
    const encoded: TEncodedTradingStatsRouteParams = encodeTypicalParams(params);

    if (ETradingStatsRouteParams.Date in params && !isNil(params[ETradingStatsRouteParams.Date])) {
        encoded[ETradingStatsRouteParams.Date] = params[ETradingStatsRouteParams.Date];
    }

    if (ETradingStatsRouteParams.From in params && !isNil(params[ETradingStatsRouteParams.From])) {
        encoded[ETradingStatsRouteParams.From] = params[ETradingStatsRouteParams.From];
    }

    if (ETradingStatsRouteParams.To in params && !isNil(params[ETradingStatsRouteParams.To])) {
        encoded[ETradingStatsRouteParams.To] = params[ETradingStatsRouteParams.To];
    }

    if (
        ETradingStatsRouteParams.BacktestingId in params &&
        !isNil(params[ETradingStatsRouteParams.BacktestingId])
    ) {
        encoded[ETradingStatsRouteParams.BacktestingId] = String(
            params[ETradingStatsRouteParams.BacktestingId],
        );
    }

    (
        [
            ETradingStatsRouteParams.BaseAssetsInclude,
            ETradingStatsRouteParams.VolumeAssetsInclude,
            ETradingStatsRouteParams.AnyAssetsInclude,
            ETradingStatsRouteParams.InstrumentsInclude,
            ETradingStatsRouteParams.ExchangesInclude,
            ETradingStatsRouteParams.StrategiesInclude,
            ETradingStatsRouteParams.BaseAssetsExclude,
            ETradingStatsRouteParams.VolumeAssetsExclude,
            ETradingStatsRouteParams.AnyAssetsExclude,
            ETradingStatsRouteParams.InstrumentsExclude,
            ETradingStatsRouteParams.ExchangesExclude,
            ETradingStatsRouteParams.StrategiesExclude,
        ] as const
    ).forEach((key) => {
        if (key in params && !isNil(params[key])) {
            const value = params[key];
            encoded[key] = isArray(value) ? value.map((item) => String(item)) : value;
        }
    });

    return encoded;
}

function mapToNumberArray(value?: unknown[] | unknown): number[] | undefined {
    if (value === undefined) {
        return value;
    }

    return (Array.isArray(value) ? value.map(Number) : [Number(value)]).filter(isFinite);
}

function mapToStringArray(value?: unknown[] | unknown): string[] | undefined {
    if (value === undefined) {
        return value;
    }

    return Array.isArray(value) ? value : [value];
}
