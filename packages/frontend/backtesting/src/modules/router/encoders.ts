import { extractValidNumber } from '@common/utils/src/extract.ts';
import {
    decodeTypicalParams,
    encodeTypicalParams,
} from '@frontend/common/src/modules/router/encoders';

import type { TAllBacktestingRouteParams, TEncodedBacktestingRouteParams } from '../../defs/router';
import { EBacktestingSearchParams } from '../../defs/router';

export const encodeParams = (
    params: TAllBacktestingRouteParams,
): TEncodedBacktestingRouteParams => {
    const encoded = encodeTypicalParams(params) as TEncodedBacktestingRouteParams;

    if (EBacktestingSearchParams.BacktestingTaskId in params) {
        encoded[EBacktestingSearchParams.BacktestingTaskId] = String(
            params[EBacktestingSearchParams.BacktestingTaskId],
        );
    }

    if (EBacktestingSearchParams.BacktestingRunId in params) {
        encoded[EBacktestingSearchParams.BacktestingRunId] = String(
            params[EBacktestingSearchParams.BacktestingRunId],
        );
    }

    return encoded;
};

export const decodeParams = (
    params: TEncodedBacktestingRouteParams,
): TAllBacktestingRouteParams => {
    return {
        ...params,
        ...decodeTypicalParams(params),
        backtestingTaskId: extractValidNumber(params[EBacktestingSearchParams.BacktestingTaskId]),
        backtestingRunId: extractValidNumber(params[EBacktestingSearchParams.BacktestingRunId]),
    } as TAllBacktestingRouteParams;
};
