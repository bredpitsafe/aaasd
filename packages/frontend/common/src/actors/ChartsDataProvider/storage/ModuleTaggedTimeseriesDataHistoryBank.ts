import type { ISO } from '@common/types';
import type { TraceId } from '@common/utils';
import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';

import { ModuleFactory } from '../../../di';
import type {
    ETimeseriesAggregationFunction,
    TTimeseriesAggregation,
    TTimeseriesFilter,
} from '../../../modules/actions/def.ts';
import { EFetchHistoryDirection } from '../../../modules/actions/def.ts';
import type { TSocketName, TSocketURL } from '../../../types/domain/sockets';
import { createBank } from '../../../utils/Bank';
import { debounceBy } from '../../../utils/debounceBy';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { InfinityHistory } from '../../../utils/InfinityHistory';
import { semanticHash } from '../../../utils/semanticHash.ts';
import { logger } from '../../../utils/Tracing';
import { Binding } from '../../../utils/Tracing/Children/Binding.ts';
import { BANK_INACTIVE_REMOVE_TIMEOUT } from '../../InfinityHistory/src/def';
import type { TTaggedTimeseriesEntity } from '../actions/ModuleFetchTaggedTimeseriesData';
import { ModuleFetchTaggedTimeseriesData } from '../actions/ModuleFetchTaggedTimeseriesData';

type TProps = {
    target: TSocketURL;
    requestStage: TSocketName;
    filter?: TTimeseriesFilter;
    aggregation: TTimeseriesAggregation<
        ETimeseriesAggregationFunction.Last | ETimeseriesAggregationFunction.FlattenCandle
    >;
};

export const ModuleTaggedTimeseriesDataHistoryBank = ModuleFactory((ctx) => {
    const fetchTaggedTimeseriesData = ModuleFetchTaggedTimeseriesData(ctx);

    return createBank({
        logger: logger.child(new Binding('TaggedTSBank')),
        createKey: (props: TProps) =>
            semanticHash.get(props, {
                target: semanticHash.withHasher(getSocketUrlHash),
                filter: {
                    ...semanticHash.withNullable(isDeepObjectEmpty),
                    ...semanticHash.withHasher<TProps['filter']>((filters) =>
                        semanticHash.get(filters, {}),
                    ),
                },
                aggregation: {},
            }),
        createValue: (key, props) => {
            function fetch(
                traceId: TraceId,
                count: number,
                start: ISO,
                startInclude: boolean,
                end: ISO,
                endInclude: boolean,
            ) {
                return fetchTaggedTimeseriesData(
                    {
                        params: {
                            softLimit: count,
                            direction: EFetchHistoryDirection.Backward,
                            platformTime: start,
                            platformTimeExcluded: !startInclude,
                            platformTimeBound: end,
                            platformTimeBoundExcluded: !endInclude,
                        },
                        ...props,
                    },
                    { traceId },
                );
            }

            return new InfinityHistory<
                TTaggedTimeseriesEntity<
                    | ETimeseriesAggregationFunction.Unspecified
                    | ETimeseriesAggregationFunction.Last
                    | ETimeseriesAggregationFunction.FlattenCandle
                >
            >({
                fetch,
                getId: (v) => v.timestamp,
                getTime: (v) => v.timestamp,
            });
        },

        onRelease: debounceBy(
            (key, value, bank) => bank.removeIfDerelict(key),
            ([key]) => ({ group: key, delay: BANK_INACTIVE_REMOVE_TIMEOUT }),
        ),

        onRemove: (key, value) => value.destroy(),
    });
});
