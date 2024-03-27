import { isEmpty, isNil, isObject } from 'lodash-es';

import { getIndicatorKey } from '../../../handlers/utils.ts';
import {
    INDICATORS_FETCH_LIMIT,
    TIndicator,
    TIndicatorsQuery,
} from '../../../modules/actions/indicators/defs.ts';
import { TSocketStruct, TSocketURL } from '../../../types/domain/sockets.ts';

export function modifyIndicators(indicators: TIndicator[], socket: TSocketURL | TSocketStruct) {
    const url = isObject(socket) ? (socket as TSocketStruct).url : socket;

    for (let i = 0; i < indicators.length; i++) {
        const indicator = indicators[i];
        indicator.url = url;
        indicator.key = getIndicatorKey(url, indicator.name, indicator.btRunNo);
    }

    return indicators;
}

export function splitQueryToChunks(query: TIndicatorsQuery, chunkSize: number): TIndicatorsQuery[] {
    const maxLength = query.names?.length || query.nameRegexes?.length;
    if (isNil(maxLength)) {
        return [query];
    }
    const queries: TIndicatorsQuery[] = [];

    for (let i = 0; i < maxLength; i += chunkSize) {
        const names = query.names?.slice(i, chunkSize + i);
        const nameRegexes = query.nameRegexes?.slice(i, chunkSize + i);

        queries.push({
            ...query,
            names: isEmpty(names) ? undefined : names,
            nameRegexes: isEmpty(nameRegexes) ? undefined : nameRegexes,
        });
    }

    return queries;
}

export function getLimit(query: TIndicatorsQuery): number {
    return query.names && query.names.length > INDICATORS_FETCH_LIMIT
        ? query.names.length
        : INDICATORS_FETCH_LIMIT;
}
