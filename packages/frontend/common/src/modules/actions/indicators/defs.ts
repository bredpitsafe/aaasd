import type { ISO, Nil, Opaque } from '@common/types';

import type { TBacktestingRunId } from '../../../types/domain/backtestings';
import type { TSocketURL } from '../../../types/domain/sockets';

// Default fetch limit, if no other filters (e.g. `names) are provided
export const INDICATORS_FETCH_LIMIT = 500;

// We should split Fetch & Subscribe to separate requests if the query is too big,
// because otherwise backend will fail with a `MAX QUERY LIMIT EXCEEDED` error.
export const MAX_INDICATOR_NAMES_IN_A_SINGLE_QUERY = 5000;

export type TIndicatorsQuery = {
    url: TSocketURL;
    btRuns?: number[];
    names?: string[];
    nameRegexes?: string[];
    minUpdateTime?: ISO;
};

export type TIndicatorKey = Opaque<
    'IndicatorKey',
    `{${TSocketURL}}.{${TIndicator['name']}.{${Nil | TBacktestingRunId}`
>;

export type TIndicator = {
    key: TIndicatorKey;
    url: TSocketURL;
    name: string;
    platformTime: ISO | null;
    updateTime: ISO | null;
    publisher: string;
    value: null | number;
    btRunNo: null | TBacktestingRunId;
};
