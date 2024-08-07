import type { KeyByType } from '@common/types';
import { useModule } from '@frontend/common/src/di/react.tsx';
import type { TRouterSubscribeState } from '@frontend/common/src/types/router.ts';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { useMemo } from 'react';

import type { TTradingServersManagerParams } from '../../modules/router/defs.ts';
import { ModuleTradingServersManagerRouter } from '../../modules/router/module.ts';

export function useRouteInstruments(
    key: KeyByType<TTradingServersManagerParams, number[] | undefined>,
): {
    instrumentsIds: number[];
    removeInstrument: (instrumentId: number) => void;
} {
    const { setParams, state$ } = useModule(ModuleTradingServersManagerRouter);

    const routeParams =
        useSyncObservable<TRouterSubscribeState<{ route: TTradingServersManagerParams }>>(state$)
            ?.route?.params;

    const instrumentsIds = useMemo<number[]>(
        () => routeParams?.[key] ?? EMPTY_ARRAY,
        [routeParams, key],
    );

    const removeInstrument = useFunction(
        (instrumentId: number) =>
            void setParams({
                [key]: instrumentsIds.filter(
                    (itemInstrumentId) => itemInstrumentId !== instrumentId,
                ),
            }),
    );

    return useMemo(
        () => ({
            instrumentsIds,
            removeInstrument,
        }),
        [instrumentsIds, removeInstrument],
    );
}
