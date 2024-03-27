import type { Observable } from 'rxjs';
import { skip, switchMap, timeout, TimeoutError } from 'rxjs';
import { catchError, filter, take, takeUntil } from 'rxjs/operators';

import { TContextRef } from '../../di';
import { EComponentCommands } from '../../handlers/def';
import { EComponentStatus } from '../../types';
import type {
    EComponentType,
    TComponentId,
    TComponentTypeToTypeId,
} from '../../types/domain/component';
import { TStructurallyCloneableObject } from '../../types/serialization';
import { ModuleCommunication } from '../communication';
import { ModuleNotifications } from '../notifications/module.ts';
import { getComponent$ } from '../utils';
import { sendComponentCommandAction } from './sendComponentCommand';

const RESTART_TIMEOUT = 30_000;

export const startComponent = sendNonGenericCommandComponentAction.bind(
    null,
    EComponentCommands.StartComponent,
);
export const stopComponent = sendNonGenericCommandComponentAction.bind(
    null,
    EComponentCommands.StopComponent,
);
export const unblockRobot = sendNonGenericCommandComponentAction.bind(
    null,
    EComponentCommands.UnblockRobot,
);

export const restartComponent = (
    ctx: TContextRef,
    type: EComponentType,
    id: TComponentId,
): Observable<TResponseData> => {
    const { currentSocketUrl$ } = ModuleCommunication(ctx);
    const { error } = ModuleNotifications(ctx);

    return stopComponent(ctx, type, id).pipe(
        take(1),
        switchMap(() => getComponent$(ctx, type, id)),
        filter(
            (component) =>
                component !== undefined && component.status === EComponentStatus.Disabled,
        ),
        take(1),
        switchMap(() => startComponent(ctx, type, id)),
        // Skip first emit since `currentSocketUrl$` uses ReplaySubject under the hood
        takeUntil(currentSocketUrl$.pipe(skip(1))),
        timeout(RESTART_TIMEOUT),
        catchError((err, caught) => {
            if (err instanceof TimeoutError) {
                error({
                    message: `Failed to restart component ${type}(${id})`,
                    description: `Component restart timeout (${
                        RESTART_TIMEOUT / 1000
                    }s). Component may execute the command later`,
                });
            }
            return caught;
        }),
    );
};

export enum ECommandResult {
    CommandAccepted,
    CommandExecuted,
}

export type TResponseData = {
    type: ECommandResult;
    resultKind: ECommandResult;
};
export function sendNonGenericCommandComponentAction<
    Type extends EComponentType,
    IdType extends TComponentTypeToTypeId[Type],
>(
    command:
        | EComponentCommands.StartComponent
        | EComponentCommands.StopComponent
        | EComponentCommands.UnblockRobot
        | EComponentCommands.DryRunComponent,
    ctx: TContextRef,
    componentType: Type,
    id: IdType,
): Observable<TResponseData> {
    return sendComponentCommandAction<TResponseData>(ctx, componentType, id, command);
}

export function sendGenericComponentCommandAction<
    Payload extends object,
    Type extends EComponentType,
    IdType extends TComponentTypeToTypeId[Type],
>(
    ctx: TContextRef,
    componentType: Type,
    id: IdType,
    commandData: TStructurallyCloneableObject,
): Observable<Payload> {
    return sendComponentCommandAction<Payload>(
        ctx,
        componentType,
        id,
        EComponentCommands.GenericRobotCommand,
        commandData,
    );
}
