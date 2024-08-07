import { milliseconds2seconds, toMilliseconds } from '@common/utils';
import type { Observable } from 'rxjs';
import { skip, switchMap, timeout, TimeoutError } from 'rxjs';
import { catchError, filter, startWith, take, takeUntil } from 'rxjs/operators';

import { EComponentStatus } from '../../../types';
import type {
    EComponentType,
    TComponentId,
    TComponentTypeToTypeId,
} from '../../../types/domain/component.ts';
import { EGrpcErrorCode, GrpcError } from '../../../types/GrpcError.ts';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure.ts';
import {
    extractSyncedValueFromValueDescriptor,
    switchMapValueDescriptor,
} from '../../../utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types.ts';
import { REQUESTING_VD } from '../../../utils/ValueDescriptor/utils.ts';
import { ModuleSocketPage } from '../../socketPage';
import type { TWithTraceId } from '../def.ts';
import { EComponentCommands } from '../def.ts';
import { ModuleSubscribeToCurrentComponent } from './ModuleSubscribeToCurrentComponent.ts';
import { ModuleUpdateComponentCommandOnCurrentStage } from './ModuleUpdateComponentCommandOnCurrentStage.ts';

export const ModuleStartComponent = createModuleUpdateComponentCommandOnCurrentStage(
    EComponentCommands.StartComponent,
);
export const ModuleStopComponent = createModuleUpdateComponentCommandOnCurrentStage(
    EComponentCommands.StopComponent,
);
export const ModuleUnblockRobot = createModuleUpdateComponentCommandOnCurrentStage(
    EComponentCommands.UnblockRobot,
);

export const ModuleRestartComponent = createObservableProcedure((ctx) => {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const stopComponent = ModuleStopComponent(ctx);
    const startComponent = ModuleStartComponent(ctx);
    const subscribeToCurrentComponent = ModuleSubscribeToCurrentComponent(ctx);
    const TIMEOUT_MS = toMilliseconds(30_000);
    const TIMEOUT_SEC = milliseconds2seconds(TIMEOUT_MS);

    return (
        params: { id: TComponentId; type: EComponentType },
        options,
    ): Observable<TValueDescriptor2<TResponseData>> => {
        return stopComponent(params, options).pipe(
            switchMapValueDescriptor(() => subscribeToCurrentComponent(params, options)),
            extractSyncedValueFromValueDescriptor(),
            filter(
                (component) =>
                    component !== undefined && component.status === EComponentStatus.Disabled,
            ),
            take(1),
            switchMap(() => startComponent(params, options)),
            timeout(TIMEOUT_MS),
            catchError((err) => {
                if (err instanceof TimeoutError) {
                    throw new GrpcError(
                        `Failed to restart component ${params.type}(${params.id})`,
                        {
                            code: EGrpcErrorCode.DEADLINE_EXCEEDED,
                            description: `Component restart timeout (${TIMEOUT_SEC}s). Component may execute the command later`,
                            traceId: options.traceId,
                        },
                    );
                }

                throw err;
            }),
            // Skip first emit since `currentSocketUrl$` uses ReplaySubject under the hood
            takeUntil(currentSocketUrl$.pipe(skip(1))),
            startWith(REQUESTING_VD),
        );
    };
});

export enum ECommandResult {
    CommandAccepted,
    CommandExecuted,
}

export type TResponseData = {
    type: ECommandResult;
    resultKind: ECommandResult;
};

function createModuleUpdateComponentCommandOnCurrentStage(
    command:
        | EComponentCommands.StartComponent
        | EComponentCommands.StopComponent
        | EComponentCommands.UnblockRobot
        | EComponentCommands.DryRunComponent,
) {
    return createObservableProcedure((ctx) => {
        const update = ModuleUpdateComponentCommandOnCurrentStage(ctx);

        return <Type extends EComponentType, IdType extends TComponentTypeToTypeId[Type]>(
            params: {
                id: IdType;
                type: Type;
            },
            options: TWithTraceId,
        ): Observable<TValueDescriptor2<TResponseData>> => {
            return update({ ...params, command }, options) as Observable<
                TValueDescriptor2<TResponseData>
            >;
        };
    });
}
