import { ModuleFactory } from '../../../di';
import {
    EFetchHistoryDirection,
    ETimeseriesAggregationFunction,
    TTimeseriesAggregation,
    TTimeseriesFilter,
} from '../../../handlers/def';
import { TSocketName } from '../../../types/domain/sockets';
import type { ISO } from '../../../types/time';
import { createBank } from '../../../utils/Bank';
import { debounceBy } from '../../../utils/debounceBy';
import { InfinityHistory } from '../../../utils/InfinityHistory';
import { semanticHash } from '../../../utils/semanticHash.ts';
import { TraceId } from '../../../utils/traceId';
import { BANK_INACTIVE_REMOVE_TIMEOUT } from '../../InfinityHistory/src/def';
import {
    ModuleFetchTaggedTimeseriesData,
    TTaggedTimeseriesEntity,
} from '../actions/ModuleFetchTaggedTimeseriesData';

type TProps = {
    requestStage: TSocketName;
    filter?: TTimeseriesFilter;
    aggregation: TTimeseriesAggregation<
        ETimeseriesAggregationFunction.Last | ETimeseriesAggregationFunction.FlattenCandle
    >;
};

export const ModuleTaggedTimeseriesDataHistoryBank = ModuleFactory((ctx) => {
    const fetchTaggedTimeseriesData = ModuleFetchTaggedTimeseriesData(ctx);

    return createBank({
        createKey: (props: TProps) => {
            return semanticHash.get(props, {
                filter: {},
                aggregation: {},
            });
        },
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
