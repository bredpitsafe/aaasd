import type { ISO, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import type { TraceId } from '@common/utils';
import { getNowDayjs } from '@common/utils';
import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';

import { ModuleFactory } from '../../../di';
import { EFetchHistoryDirection } from '../../../modules/actions/def.ts';
import type { TWithSocketTarget } from '../../../types/domain/sockets';
import { createBank } from '../../../utils/Bank';
import { debounceBy } from '../../../utils/debounceBy';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { InfinityHistory } from '../../../utils/InfinityHistory';
import { semanticHash } from '../../../utils/semanticHash';
import { logger } from '../../../utils/Tracing';
import { Binding } from '../../../utils/Tracing/Children/Binding.ts';
import { BANK_INACTIVE_REMOVE_TIMEOUT } from './def';
import type { TFetchOwnTradesFilters } from './ModuleFetchOwnTrades.ts';
import { ModuleFetchOwnTrades } from './ModuleFetchOwnTrades.ts';
import { ModuleSubscribeToOwnTrades } from './ModuleSubscribeToOwnTrades.ts';
import { fetchOwnTradesFiltersHashDescriptor } from './utils.ts';

type TProps = TWithSocketTarget & {
    filters: TFetchOwnTradesFilters;
    timeZone: TimeZone;
};

export const ModuleOwnTradesInfinityHistoryBank = ModuleFactory((ctx) => {
    const fetchOwnTrades = ModuleFetchOwnTrades(ctx);
    const subscribeToOwnTrades = ModuleSubscribeToOwnTrades(ctx);

    return createBank({
        logger: logger.child(new Binding('OwnTradesBank')),
        createKey: (props: TProps) =>
            semanticHash.get(props, {
                target: semanticHash.withHasher(getSocketUrlHash),
                filters: {
                    ...semanticHash.withNullable(isDeepObjectEmpty),
                    ...semanticHash.withHasher<TFetchOwnTradesFilters>((filters) =>
                        semanticHash.get(filters, fetchOwnTradesFiltersHashDescriptor),
                    ),
                },
            }),
        createValue: (key, { target, filters, timeZone }: TProps) => {
            function fetch(
                traceId: TraceId,
                count: number,
                start: ISO,
                startInclude: boolean,
                end: ISO,
                endInclude: boolean,
            ) {
                return fetchOwnTrades(
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
                return subscribeToOwnTrades(
                    {
                        target,
                        filters,
                        params: {
                            date: getNowDayjs(timeZone).format(EDateTimeFormats.Date),
                            timeZone,
                        },
                        updatesOnly: true,
                    },
                    { traceId, enableRetries: false },
                );
            }

            return new InfinityHistory({
                fetch,
                subscribe,
                getId: (v) => v.tradeId,
                getTime: (v) => v.platformTime,
            });
        },
        onRelease: debounceBy(
            (key, value, bank) => bank.removeIfDerelict(key),
            ([key]) => ({ group: key, delay: BANK_INACTIVE_REMOVE_TIMEOUT }),
        ),
        onRemove: (key, value) => value.destroy(),
    });
});
