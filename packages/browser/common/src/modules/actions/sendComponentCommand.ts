import type { Observable } from 'rxjs';
import { first } from 'rxjs';
import { finalize, map, switchMap, tap } from 'rxjs/operators';

import { TContextRef } from '../../di';
import { EComponentCommands } from '../../handlers/def';
import { updateComponentCommandHandle } from '../../handlers/sendComponentCommandHandle';
import { ModuleMessages } from '../../lib/messages';
import type { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import type {
    EComponentType,
    TComponentTypeToType,
    TComponentTypeToTypeId,
} from '../../types/domain/component';
import { TSocketURL } from '../../types/domain/sockets';
import { TStructurallyCloneableObject } from '../../types/serialization';
import { ModuleCommunication } from '../communication';
import { ModuleNotifications } from '../notifications/module';
import { getComponent } from '../utils';
import { ModuleBaseActions } from './index';

export const componentCommandLabel = {
    [EComponentCommands.StartComponent]: 'Start',
    [EComponentCommands.StopComponent]: 'Stop',
    [EComponentCommands.UnblockRobot]: 'UnblockRobot',
    [EComponentCommands.DryRunComponent]: 'Dry Run',
    [EComponentCommands.GenericRobotCommand]: 'Generic command',
};

export function sendComponentCommandAction<
    Payload extends object,
    Type extends EComponentType = EComponentType,
    IdType extends TComponentTypeToTypeId[Type] = TComponentTypeToTypeId[Type],
>(
    ctx: TContextRef,
    type: Type,
    id: IdType,
    command: EComponentCommands,
    commandData?: TStructurallyCloneableObject,
): Observable<Payload> {
    const { update, currentSocketUrl$ } = ModuleCommunication(ctx);
    const messages = ModuleMessages(ctx);
    const notifications = ModuleNotifications(ctx);
    const { setComponentUpdating } = ModuleBaseActions(ctx);

    const comp = getComponent(ctx, type, id) as TComponentTypeToType[Type];
    const actionLabel = componentCommandLabel[command];
    const closeMsg = setComponentUpdating(type, id, `${actionLabel} ${comp.kind}(${comp.name})...`);

    return currentSocketUrl$.pipe(
        first((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            updateComponentCommandHandle(update, url, id, command, commandData).pipe(
                finalize(() => {
                    closeMsg();
                }),
                map((envelope) => envelope.payload as Payload),
                tap({
                    next() {
                        messages.success(
                            `Command "${actionLabel}" sent for ${comp.kind}(${comp.name}|${comp.id})`,
                        );
                    },
                    error(err: SocketStreamError) {
                        closeMsg();
                        const message = `Error sending command "${actionLabel}" for ${comp.kind}(${comp.name}|${comp.id})`;

                        notifications.error({
                            message,
                            description: err.message,
                            traceId: err.traceId,
                        });
                        messages.error(message);
                    },
                }),
            ),
        ),
    );
}
