import { generateTraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleGetAvailableAccountsOnCurrentStage } from '@frontend/common/src/modules/actions/components/ModuleGetAvailableAccountsOnCurrentStage.ts';
import { ModuleSubscribeToAssetsOnCurrentStage } from '@frontend/common/src/modules/actions/dictionaries/ModuleSubscribeToAssetsOnCurrentStage.ts';
import { ModuleSubscribeToInstrumentsOnCurrentStage } from '@frontend/common/src/modules/actions/dictionaries/ModuleSubscribeToInstrumentsOnCurrentStage.ts';
import type { TAsset } from '@frontend/common/src/types/domain/asset';
import type { TExchange } from '@frontend/common/src/types/domain/exchange';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument';
import { EInstrumentStatus } from '@frontend/common/src/types/domain/instrument';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { componentIsAllowed } from '@frontend/common/src/utils/domain/components';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isNil, uniqBy } from 'lodash-es';
import { useMemo } from 'react';
import { EMPTY } from 'rxjs';

import type { THerodotusAccount } from '../types/domain';
import { useOnlyTradingInstruments } from './useOnlyTradingInstruments.ts';

export type THerodotusData = {
    assets: TAsset[];
    instruments: TInstrument[];
    exchanges: TExchange[];
    accounts: THerodotusAccount[];
    enabled: boolean;
};

export function useHerodotusData(robot?: TRobot): THerodotusData {
    const subscribeToAssets = useModule(ModuleSubscribeToAssetsOnCurrentStage);
    const getAvailableAccounts = useModule(ModuleGetAvailableAccountsOnCurrentStage);
    const subscribeToInstruments = useModule(ModuleSubscribeToInstrumentsOnCurrentStage);

    const [onlyTradingInstruments] = useOnlyTradingInstruments();

    const assets = useNotifiedValueDescriptorObservable(
        subscribeToAssets(undefined, { traceId: generateTraceId() }),
    );
    const instrumentsFilters = useMemo(
        () => ({ statuses: onlyTradingInstruments ? [EInstrumentStatus.Trading] : undefined }),
        [onlyTradingInstruments],
    );
    const instruments = useNotifiedValueDescriptorObservable(
        subscribeToInstruments(instrumentsFilters, { traceId: generateTraceId() }),
    );

    const accounts$ = useMemo(() => {
        if (isNil(robot?.id) || isNil(robot?.status)) {
            return EMPTY;
        }

        return componentIsAllowed(robot.status)
            ? getAvailableAccounts(robot.id, { traceId: generateTraceId() })
            : EMPTY;
    }, [getAvailableAccounts, robot?.id, robot?.status]);
    const accounts = useNotifiedValueDescriptorObservable(accounts$) ?? EMPTY_ARRAY;

    const exchanges = useMemo(
        () =>
            uniqBy(instruments.value?.map(({ exchange: name }) => ({ name })), ({ name }) => name),
        [instruments],
    );

    return {
        assets: assets.value ?? EMPTY_ARRAY,
        instruments: instruments.value ?? EMPTY_ARRAY,
        accounts: accounts.value ?? EMPTY_ARRAY,
        exchanges,
        enabled: isNil(robot) ? false : componentIsAllowed(robot.status),
    };
}
