import { useModule } from '@frontend/common/src/di/react';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import type { TAsset } from '@frontend/common/src/types/domain/asset';
import type { TExchange } from '@frontend/common/src/types/domain/exchange';
import { EInstrumentStatus, TInstrument } from '@frontend/common/src/types/domain/instrument';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { componentIsAllowed } from '@frontend/common/src/utils/domain/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil, uniqBy } from 'lodash-es';
import { useMemo } from 'react';
import { EMPTY } from 'rxjs';

import { THerodotusAccount } from '../types/domain';
import { useOnlyTradingInstruments } from './useOnlyTradingInstruments.ts';

export type THerodotusData = {
    assets: TAsset[];
    instruments: TInstrument[];
    exchanges: TExchange[];
    accounts: THerodotusAccount[];
    enabled: boolean;
};

export function useHerodotusData(robot?: TRobot): THerodotusData {
    const { getSocketAssetsDedobsed$, getSocketInstrumentsDedobsed$ } =
        useModule(ModuleBaseActions);

    const [onlyTradingInstruments] = useOnlyTradingInstruments();

    const assets = useSyncObservable(getSocketAssetsDedobsed$()) ?? EMPTY_ARRAY;
    const instruments =
        useSyncObservable(
            useMemo(
                () =>
                    getSocketInstrumentsDedobsed$({
                        statuses: onlyTradingInstruments ? [EInstrumentStatus.Trading] : undefined,
                    }),
                [getSocketInstrumentsDedobsed$, onlyTradingInstruments],
            ),
        ) ?? EMPTY_ARRAY;

    const { getAvailableAccounts } = useModule(ModuleBaseActions);

    const accounts$ = useMemo(() => {
        if (isNil(robot?.id) || isNil(robot?.status)) {
            return EMPTY;
        }

        return componentIsAllowed(robot.status) ? getAvailableAccounts(robot.id) : EMPTY;
    }, [getAvailableAccounts, robot?.id, robot?.status]);
    const accounts = useSyncObservable(accounts$) ?? EMPTY_ARRAY;

    const exchanges = useMemo(
        () => uniqBy(instruments?.map(({ exchange: name }) => ({ name })), ({ name }) => name),
        [instruments],
    );

    return {
        assets,
        instruments,
        exchanges,
        accounts,
        enabled: isNil(robot) ? false : componentIsAllowed(robot.status),
    };
}
