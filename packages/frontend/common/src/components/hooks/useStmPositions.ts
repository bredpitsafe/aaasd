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
import type { TStmPositionFilter } from '../../modules/robotPositions/defs';
import { ModuleStmPositions } from '../../modules/robotPositions/stmPositions';
import { ModuleSocketPage } from '../../modules/socketPage';
import type { TVirtualAccount, TVirtualAccountId } from '../../types/domain/account';
import type { TInstrument, TInstrumentId } from '../../types/domain/instrument';
import type { TRobot, TRobotId } from '../../types/domain/robots';
import { useNotifiedValueDescriptorObservable } from '../../utils/React/useValueDescriptorObservable';
import { mapValueDescriptor } from '../../utils/Rx/ValueDescriptor2';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import { createSyncedValueDescriptor, WAITING_VD } from '../../utils/ValueDescriptor/utils';

export type TStmPositionRow = {
    rowKey: string;
    platformTime: ISO;
    virtualAccountId: TVirtualAccountId;
    virtualAccountName: TVirtualAccount['name'];
    instrumentId: TInstrumentId;
    instrumentName: TInstrument['name'];
    robotId: TRobotId;
    robotName: TRobot['name'];
    position: number;
};

export function useStmPositions({
    instrumentIds,
    virtualAccountIds,
    robotIds,
    nonZeroPositions,
}: TStmPositionFilter): TValueDescriptor2<TStmPositionRow[]> {
    const { currentSocketName$ } = useModule(ModuleSocketPage);
    const { getCurrentBFFSocket$ } = useModule(ModuleBFF);
    const { mock$ } = useModule(ModuleMock);

    const subscribeToStmPositions$ = useModule(ModuleStmPositions);

    const bffSocket$ = useMemo(() => getCurrentBFFSocket$(), [getCurrentBFFSocket$]);

    const includeFilter = useMemo(
        () => ({ instrumentIds, virtualAccountIds, robotIds, nonZeroPositions }),
        [instrumentIds, virtualAccountIds, robotIds, nonZeroPositions],
    );

    const traceId = useTraceId();

    const stmPositions$ = useMemo(() => {
        return combineLatest([
            bffSocket$,
            currentSocketName$ as Observable<TStageName | undefined>,
            mock$,
        ]).pipe(
            switchMap(([bffSocket, requestStage, mock]) => {
                return isNil(requestStage)
                    ? of(WAITING_VD)
                    : subscribeToStmPositions$(
                          { bffSocket, requestStage, includeFilter, mock },
                          { traceId },
                      );
            }),
            mapValueDescriptor(({ value }) =>
                createSyncedValueDescriptor(
                    value.map(
                        (item) =>
                            ({
                                rowKey: `${item.instrumentId}:${item.virtualAccountId}:${item.robotId}`,
                                platformTime: item.platformTime,
                                virtualAccountId: item.virtualAccountId,
                                virtualAccountName: item.virtualAccountName,
                                instrumentId: item.instrumentId,
                                instrumentName: item.instrumentName,
                                robotId: item.robotId,
                                robotName: item.robotName,
                                position: item.position,
                            }) as TStmPositionRow,
                    ),
                ),
            ),
        );
    }, [bffSocket$, currentSocketName$, mock$, subscribeToStmPositions$, includeFilter, traceId]);

    return useNotifiedValueDescriptorObservable(stmPositions$);
}
