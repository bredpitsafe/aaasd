import { first } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { TContextRef } from '../../di';
import { updateConfigHandle } from '../../handlers/config/updateConfigHandle';
import { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import type {
    EComponentType,
    TComponentTypeToType,
    TComponentTypeToTypeId,
} from '../../types/domain/component';
import { TSocketURL } from '../../types/domain/sockets';
import { tapError } from '../../utils/Rx/tap';
import { ModuleCommunication } from '../communication';
import { ModuleMessages } from '../messages';
import { ModuleNotifications } from '../notifications/module';
import { getComponent } from '../utils';
import { ModuleBaseActions } from './index';

export const updateComponentConfig = <
    T extends EComponentType,
    ID extends TComponentTypeToTypeId[T],
>(
    ctx: TContextRef,
    componentType: T,
    componentId: ID,
    config: string,
    digest?: string,
): ReturnType<typeof updateConfigHandle> => {
    const { update, currentSocketUrl$ } = ModuleCommunication(ctx);
    const messages = ModuleMessages(ctx);
    const notifications = ModuleNotifications(ctx);
    const { setComponentUpdating } = ModuleBaseActions(ctx);

    const comp = getComponent(ctx, componentType, componentId) as TComponentTypeToType[T];

    const closeMsg = setComponentUpdating(
        componentType,
        componentId,
        `Updating config for ${comp.kind}(${comp.name})...`,
    );

    return currentSocketUrl$.pipe(
        first((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            updateConfigHandle(update, url, componentId, config, digest).pipe(
                tap(() => {
                    closeMsg();
                    messages.success(`Config updated successfully for ${comp.kind}(${comp.name})`);
                }),
                tapError((err) => {
                    const msg = `Error updating config for ${comp.kind}(${comp.name})`;

                    closeMsg();
                    messages.error(msg);

                    if (err instanceof SocketStreamError) {
                        notifications.error({
                            message: msg,
                            description: err.message,
                            traceId: err.traceId,
                        });
                    }
                }),
            ),
        ),
    );
};
