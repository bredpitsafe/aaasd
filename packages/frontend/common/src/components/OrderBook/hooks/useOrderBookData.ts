import { tapError } from '@common/rx';
import { assert } from '@common/utils/src/assert.ts';
import { clamp, isEmpty, isNil } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import { EMPTY, first } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { useModule } from '../../../di/react';
import { useTraceId } from '../../../hooks/useTraceId';
import type {
    TOrderBookSnapshot,
    TOrderBookUpdate,
} from '../../../modules/actions/orderBook/defs.ts';
import { ModuleGetOrderBookSnapshots } from '../../../modules/actions/orderBook/ModuleGetOrderBookSnapshots';
import { ModuleGetOrderBookUpdates } from '../../../modules/actions/orderBook/ModuleGetOrderBookUpdates';
import type { TBacktestingRun } from '../../../types/domain/backtestings';
import type { TSocketURL } from '../../../types/domain/sockets';
import { useSyncState } from '../../../utils/React/useSyncState';
import { useNotifiedValueDescriptorObservable } from '../../../utils/React/useValueDescriptorObservable';
import { extractSyncedValueFromValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';
import type { TOrderBookData, TOrderBookFormFilter } from '../defs';
import { mergeUpdateToSnapshot } from '../utils';

const DEFAULT_UPDATE_REQUESTS = 20;
const FUTURE_REQUESTS = 5;

type TOrderBookStep = { snapshot: TOrderBookSnapshot; update?: TOrderBookUpdate };

export function useOrderBookData(
    socketUrl: TSocketURL,
    filters: TOrderBookFormFilter | undefined,
    currentStep: number,
    btRunNo?: TBacktestingRun['btRunNo'],
): undefined | Error | TOrderBookData {
    const traceId = useTraceId();
    const getOrderBookUpdates = useModule(ModuleGetOrderBookUpdates);
    const getOrderBookSnapshot = useModule(ModuleGetOrderBookSnapshots);

    const [error, setError] = useSyncState<undefined | Error>(undefined, [socketUrl]);

    const snapshot = useNotifiedValueDescriptorObservable(
        useMemo(() => {
            setError(undefined);

            return isNil(filters)
                ? EMPTY
                : getOrderBookSnapshot(
                      {
                          target: socketUrl,
                          filters: {
                              btRunNo,
                              instrumentId: filters.instrumentId,
                              platformTime: filters.platformTime,
                          },
                          params: {
                              depth: filters.depth,
                          },
                      },
                      {
                          traceId,
                      },
                  ).pipe(tapError((error) => setError(error)));
        }, [setError, filters, getOrderBookSnapshot, socketUrl, btRunNo, traceId]),
    );

    const [steps, setSteps] = useSyncState<TOrderBookStep[]>(
        isNil(snapshot.value) ? [] : [{ snapshot: snapshot.value }],
        [snapshot],
    );

    const needNewUpdates = !isEmpty(steps) && currentStep + 1 + FUTURE_REQUESTS >= steps.length;

    const [loading, setLoading] = useSyncState(false, [snapshot]);

    useEffect(() => {
        if (steps.length === 0 || !needNewUpdates) {
            return;
        }

        setLoading(true);

        const lastStep = steps.at(-1);

        assert(!isNil(filters), 'Filters should be defined');
        assert(!isNil(lastStep), 'Last step should be defined');

        const subscription = getOrderBookUpdates(
            {
                target: socketUrl,
                filters: {
                    btRunNo,
                    instrumentId: filters.instrumentId,
                    platformTime: lastStep.snapshot.platformTime,
                },
                params: {
                    count: Math.max(DEFAULT_UPDATE_REQUESTS, FUTURE_REQUESTS),
                },
            },
            { traceId },
        )
            .pipe(
                extractSyncedValueFromValueDescriptor(),
                first(),
                tapError((error) => setError(error)),
                finalize(() => setLoading(false)),
            )
            .subscribe(({ updates }) => {
                if (updates.length === 0) {
                    if (steps.length === 1) {
                        setError(new Error('No updates available'));
                    }
                    return;
                }

                setSteps(extendOrderBookSteps(steps, updates));
            });

        return () => subscription.unsubscribe();
    }, [
        getOrderBookUpdates,
        setSteps,
        socketUrl,
        steps,
        needNewUpdates,
        filters,
        btRunNo,
        setError,
        setLoading,
        traceId,
    ]);

    if (!isNil(error)) {
        return error;
    }

    if (steps.length <= 1) {
        return undefined;
    }

    const stepRangeMin = 0;
    const stepRangeMax = steps.length - 2;

    const item = steps[clamp(currentStep, stepRangeMin, stepRangeMax)];

    return {
        snapshot: item.snapshot,
        update: item.update!,
        stepRange: { min: stepRangeMin, max: stepRangeMax },
        loading,
    };
}

function extendOrderBookSteps(
    steps: TOrderBookStep[],
    updates: TOrderBookUpdate[],
): TOrderBookStep[] {
    const { snapshot } = steps.pop()!;

    const newSteps = updates.reduce((acc, update, index, { length }) => {
        const last = acc.at(-1);
        const currentSnapshot = isNil(last)
            ? snapshot
            : mergeUpdateToSnapshot(last.snapshot, last.update);

        acc.push({ snapshot: currentSnapshot, update });

        if (index === length - 1) {
            acc.push({ snapshot: mergeUpdateToSnapshot(currentSnapshot, update) });
        }

        return acc;
    }, [] as TOrderBookStep[]);

    return [...steps, ...newSteps];
}
