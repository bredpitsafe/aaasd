import { omit } from 'lodash-es';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TReceivedData } from '../../lib/BFFSocket/def';
import type { TIndicator } from '../../modules/actions/indicators/defs';
import type { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import { TBacktestingRunId } from '../../types/domain/backtestings';
import type { TSocketURL } from '../../types/domain/sockets';
import type { ISO } from '../../types/time';
import { logger } from '../../utils/Tracing';
import type { TFetchSortFieldsOrder } from '../def';
import { getTraceId } from '../utils';
import { modifyIndicators } from './utils';

export type TFetchIndicatorsSnapshotParams = {
    limit: number;
    offset: number;
    withTotals?: boolean;
};

export type TFetchIndicatorsSnapshotFilters = {
    btRuns?: TBacktestingRunId[];
    names?: string[];
    nameRegexes?: string[];
    // if not defined will be returned latest (actual) snapshot, if defined historical snapshot will be returned.
    platformTime?: ISO;
    minUpdateTime?: ISO;
};

export type TFetchIndicatorsSnapshotSort = {
    fieldsOrder?: TFetchSortFieldsOrder<TIndicator>;
};

export type TFetchIndicatorsSnapshotProps = {
    params: TFetchIndicatorsSnapshotParams;
    filters?: TFetchIndicatorsSnapshotFilters;
    sort?: TFetchIndicatorsSnapshotSort;
};

type TSendBody = {
    type: 'FetchIndicatorsSnapshot';
    params: TFetchIndicatorsSnapshotParams & Pick<TFetchIndicatorsSnapshotFilters, 'platformTime'>;
    filters?: Omit<TFetchIndicatorsSnapshotFilters, 'platformTime'>;
    sort?: TFetchIndicatorsSnapshotSort;
};

export type TIndicatorsSnapshot = {
    type: 'IndicatorsSnapshot';
    checkedIntervalStart: ISO;
    checkedIntervalEnd: ISO;
    total: null | number;
    entities: TIndicator[];
};

type TReceiveBody = TIndicatorsSnapshot;

export function fetchIndicatorsSnapshotHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    props: TFetchIndicatorsSnapshotProps,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[fetchIndicatorsSnapshot]: init observable', {
        traceId,
        url,
        props,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'FetchIndicatorsSnapshot',
            params: {
                ...props.params,
                platformTime: props.filters?.platformTime,
            },
            filters: omit(props.filters, 'platformTime'),
            sort: props.sort,
        },
        { ...options, traceId },
    ).pipe(
        map((envelope) => {
            modifyIndicators(envelope.payload.entities, url);
            return envelope;
        }),
    );
}
