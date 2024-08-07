import type { ISO } from '@common/types';
import type { TraceId } from '@common/utils';
import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';

import { ModuleFactory } from '../../../di';
import { EFetchHistoryDirection } from '../../../modules/actions/def.ts';
import type { TProductLog, TProductLogFilters } from '../../../modules/actions/productLogs/defs.ts';
import type { TWithSocketTarget } from '../../../types/domain/sockets';
import { createBank } from '../../../utils/Bank';
import { debounceBy } from '../../../utils/debounceBy';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { InfinityHistory } from '../../../utils/InfinityHistory';
import { semanticHash } from '../../../utils/semanticHash';
import { logger } from '../../../utils/Tracing';
import { Binding } from '../../../utils/Tracing/Children/Binding.ts';
import { BANK_INACTIVE_REMOVE_TIMEOUT } from './def';
import { ModuleFetchProductLogs } from './ModuleFetchProductLogs.ts';
import { ModuleSubscribeToProductLogs } from './ModuleSubscribeToProductLogs.ts';
import { productLogsFiltersHashDescriptor } from './utils.ts';

type TProps = TWithSocketTarget & {
    filters: TProductLogFilters;
};

export const ModuleProductLogsInfinityHistoryBank = ModuleFactory((ctx) => {
    const fetchLogs = ModuleFetchProductLogs(ctx);
    const subscribeToLogs = ModuleSubscribeToProductLogs(ctx);

    return createBank({
        logger: logger.child(new Binding('ProductLogsBank')),
        createKey: (props: TProps) =>
            semanticHash.get(props, {
                target: semanticHash.withHasher(getSocketUrlHash),
                filters: {
                    ...semanticHash.withNullable(isDeepObjectEmpty),
                    ...semanticHash.withHasher<TProductLogFilters>((filters) =>
                        semanticHash.get(filters, productLogsFiltersHashDescriptor),
                    ),
                },
            }),
        createValue: (key, { target, filters }) => {
            function fetch(
                traceId: TraceId,
                count: number,
                start: ISO,
                startInclude: boolean,
                end: ISO,
                endInclude: boolean,
            ) {
                return fetchLogs(
                    {
                        target,
                        filters,
                        params: {
                            limit: Math.abs(count),
                            direction:
                                count > 0
                                    ? EFetchHistoryDirection.Forward
                                    : EFetchHistoryDirection.Backward,
                            timestamp: start,
                            timestampExcluded: !startInclude,
                            timestampBound: end,
                            timestampBoundExcluded: !endInclude,
                        },
                    },
                    { traceId },
                );
            }

            function subscribe(traceId: TraceId) {
                return subscribeToLogs(
                    {
                        target,
                        filters,
                        updatesOnly: true,
                    },
                    {
                        traceId,
                        enableRetries: false,
                    },
                );
            }

            return new InfinityHistory<TProductLog>({
                fetch,
                subscribe,
                getId: (v) => v.fingerprint,
                getTime: (v) => v.platformTime,
                usePseudoTimeNow: filters.backtestingRunId !== undefined,
            });
        },
        onRelease: debounceBy(
            (key, value, bank) => bank.removeIfDerelict(key),
            ([key]) => ({ group: key, delay: BANK_INACTIVE_REMOVE_TIMEOUT }),
        ),
        onRemove: (key, value) => value.destroy(),
    });
});
