import type { ISO, KeyByType } from '@common/types';
import { useModule } from '@frontend/common/src/di/react.tsx';
import type { TRouterSubscribeState } from '@frontend/common/src/types/router.ts';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { isNil, isNumber } from 'lodash-es';
import { useMemo } from 'react';

import type {
    TRevisionInstrument,
    TTradingServersManagerParams,
} from '../../modules/router/defs.ts';
import { ModuleTradingServersManagerRouter } from '../../modules/router/module.ts';
import type { TRevisionList } from '../../types/instruments.ts';

export function useRouteRevisionInstruments(
    key: KeyByType<TTradingServersManagerParams, TRevisionInstrument[] | undefined>,
): {
    revisionInstrumentsIds: TRevisionInstrument[];
    removeInstrument: (instrumentId: number) => void;
    removeInstrumentRevision: (instrumentId: number, revisionPlatformTime?: ISO) => void;
    setInstrumentRevisions: (instrumentId: number, revisions: TRevisionList) => void;
} {
    const { setParams, state$ } = useModule(ModuleTradingServersManagerRouter);

    const routeParams =
        useSyncObservable<TRouterSubscribeState<{ route: TTradingServersManagerParams }>>(state$)
            ?.route?.params;

    const revisionInstrumentsIds = useMemo<TRevisionInstrument[]>(
        () => routeParams?.[key] ?? EMPTY_ARRAY,
        [routeParams, key],
    );

    const removeInstrument = useFunction(
        (instrumentId: number) =>
            void setParams({
                [key]: revisionInstrumentsIds.filter((instrumentRevId) =>
                    isNumber(instrumentRevId)
                        ? instrumentRevId !== instrumentId
                        : instrumentRevId.instrumentId !== instrumentId,
                ),
            }),
    );

    const removeInstrumentRevision = useFunction(
        (instrumentId: number, revisionPlatformTime?: ISO) => {
            const instrumentsRevs = isNil(revisionPlatformTime)
                ? revisionInstrumentsIds.filter((instrumentRevId) =>
                      isNumber(instrumentRevId)
                          ? instrumentRevId !== instrumentId
                          : instrumentRevId.instrumentId !== instrumentId ||
                            instrumentRevId.platformTime.length > 1 ||
                            (instrumentRevId.platformTime.length === 1 &&
                                !isNil(instrumentRevId.platformTime[0])),
                  )
                : revisionInstrumentsIds.filter(
                      (instrumentRevId) =>
                          isNumber(instrumentRevId) ||
                          instrumentRevId.instrumentId !== instrumentId ||
                          instrumentRevId.platformTime.length !== 1 ||
                          (instrumentRevId.platformTime.length === 1 &&
                              instrumentRevId.platformTime[0] !== revisionPlatformTime),
                  );

            void setParams({
                [key]: instrumentsRevs.map((instrumentRevId) =>
                    isNumber(instrumentRevId) || instrumentRevId.instrumentId !== instrumentId
                        ? instrumentRevId
                        : {
                              ...instrumentRevId,
                              platformTime: instrumentRevId.platformTime.filter((platformTime) =>
                                  isNil(revisionPlatformTime)
                                      ? !isNil(platformTime)
                                      : platformTime !== revisionPlatformTime,
                              ),
                          },
                ),
            });
        },
    );

    const setInstrumentRevisions = useFunction((instrumentId: number, revisions: TRevisionList) => {
        if (revisions.length === 0) {
            removeInstrument(instrumentId);
            return;
        }

        const platformTime =
            revisions.length === 1 && revisions[0] === undefined ? undefined : revisions;

        void setParams({
            [key]: revisionInstrumentsIds.map((instrumentRevId) => {
                if (
                    isNumber(instrumentRevId)
                        ? instrumentRevId !== instrumentId
                        : instrumentRevId.instrumentId !== instrumentId
                ) {
                    return instrumentRevId;
                }

                return isNil(platformTime) ? instrumentId : { instrumentId, platformTime };
            }),
        });
    });

    return useMemo(
        () => ({
            revisionInstrumentsIds,
            removeInstrument,
            removeInstrumentRevision,
            setInstrumentRevisions,
        }),
        [
            revisionInstrumentsIds,
            removeInstrument,
            removeInstrumentRevision,
            setInstrumentRevisions,
        ],
    );
}
