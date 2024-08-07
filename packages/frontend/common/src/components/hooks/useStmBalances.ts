import type { TStageName } from '@backend/bff/src/def/stages';
import type { ISO } from '@common/types';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import type { Observable } from 'rxjs';
import { combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { useModule } from '../../di/react';
import { useTraceId } from '../../hooks/useTraceId';
import { ModuleBFF } from '../../modules/bff';
import { ModuleMock } from '../../modules/mock';
import type { TStmBalanceFilter } from '../../modules/robotBalances/defs';
import { ModuleStmBalances } from '../../modules/robotBalances/stmBalances';
import { ModuleSocketPage } from '../../modules/socketPage';
import type { TVirtualAccount, TVirtualAccountId } from '../../types/domain/account';
import type { TAsset, TAssetId } from '../../types/domain/asset';
import type { TInstrument, TInstrumentId } from '../../types/domain/instrument';
import type { TRobot, TRobotId } from '../../types/domain/robots';
import { EMPTY_ARRAY } from '../../utils/const';
import { useNotifiedValueDescriptorObservable } from '../../utils/React/useValueDescriptorObservable';
import { mapValueDescriptor } from '../../utils/Rx/ValueDescriptor2';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import { createSyncedValueDescriptor, WAITING_VD } from '../../utils/ValueDescriptor/utils';

export type TStmBalanceRow = {
    rowKey: string;
    platformTime: ISO;
    virtualAccountId: TVirtualAccountId;
    virtualAccountName: TVirtualAccount['name'];
    instrumentId: TInstrumentId;
    instrumentName: TInstrument['name'];
    robotId: TRobotId;
    robotName: TRobot['name'];
    assetId: TAssetId;
    assetName: TAsset['name'];
    balance: number;
    groupKey: string;
};

export function useStmBalances({
    instrumentIds,
    virtualAccountIds,
    robotIds,
    assetIds,
    nonZeroBalances,
}: TStmBalanceFilter): TValueDescriptor2<TStmBalanceRow[]> {
    const { currentSocketName$ } = useModule(ModuleSocketPage);
    const { getCurrentBFFSocket$ } = useModule(ModuleBFF);

    const subscribeToStmBalances$ = useModule(ModuleStmBalances);
    const { mock$ } = useModule(ModuleMock);

    const bffSocket$ = useMemo(() => getCurrentBFFSocket$(), [getCurrentBFFSocket$]);

    const includeFilter = useMemo(
        () => ({
            instrumentIds,
            virtualAccountIds,
            assetIds,
            robotIds,
            nonZeroBalances,
        }),
        [instrumentIds, virtualAccountIds, assetIds, robotIds, nonZeroBalances],
    );

    const traceId = useTraceId();

    const stmBalances$ = useMemo(
        () =>
            combineLatest([
                bffSocket$,
                currentSocketName$ as Observable<TStageName | undefined>,
                mock$,
            ]).pipe(
                switchMap(([bffSocket, requestStage, mock]) =>
                    isNil(requestStage)
                        ? of(WAITING_VD)
                        : subscribeToStmBalances$(
                              { bffSocket, requestStage, includeFilter, mock },
                              { traceId },
                          ),
                ),
                mapValueDescriptor(({ value }) =>
                    createSyncedValueDescriptor(
                        value
                            .map(
                                (item) =>
                                    item.balances?.map(
                                        (balance, index) =>
                                            ({
                                                rowKey: `${item.instrumentId}:${item.virtualAccountId}:${item.robotId}:${balance.assetId}:${index}`,
                                                groupKey: `${item.instrumentId}:${item.virtualAccountId}`,
                                                platformTime: item.platformTime,
                                                virtualAccountId: item.virtualAccountId,
                                                virtualAccountName: item.virtualAccountName,
                                                instrumentId: item.instrumentId,
                                                instrumentName: item.instrumentName,
                                                robotId: item.robotId,
                                                robotName: item.robotName,
                                                assetId: balance.assetId,
                                                assetName: balance.assetName,
                                                balance: balance.amount,
                                            }) as TStmBalanceRow,
                                    ) ?? EMPTY_ARRAY,
                            )
                            .flat(),
                    ),
                ),
            ),
        [bffSocket$, currentSocketName$, mock$, subscribeToStmBalances$, includeFilter, traceId],
    );

    return useNotifiedValueDescriptorObservable(stmBalances$);
}
