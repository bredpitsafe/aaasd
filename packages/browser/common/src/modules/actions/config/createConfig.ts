import type { Observable } from 'rxjs';
import { first } from 'rxjs';
import { finalize, map, switchMap, tap } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import { createConfigHandle } from '../../../handlers/config/createConfigHandle';
import type { TConfigId } from '../../../handlers/config/def';
import type { EComponentConfigType } from '../../../types/domain/component';
import type { TSocketURL } from '../../../types/domain/sockets';
import { tapError } from '../../../utils/Rx/tap';
import { ModuleCommunicationRemoted } from '../../communicationRemote';
import { ModuleMessages } from '../../messages';
import { ModuleNotifications } from '../../notifications/module';

type TResult = {
    id: TConfigId;
    digest: string;
};

export function createConfig(
    ctx: TContextRef,
    configType: EComponentConfigType,
    config: string,
    name?: string,
    kind?: string,
): Observable<TResult> {
    const { request, currentSocketUrl$ } = ModuleCommunicationRemoted(ctx);

    const messages = ModuleMessages(ctx);
    const { error } = ModuleNotifications(ctx);
    const closeMsg = messages.loading(`Saving ${configType}...`);

    return currentSocketUrl$.pipe(
        first((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            createConfigHandle(request, url, configType, config, name, kind).pipe(
                map(({ payload }) => payload),
                finalize(() => closeMsg()),
                tap(() => messages.success(`${configType} config saved!`)),
                tapError((err) =>
                    error({
                        message: `Could not save ${configType} config!`,
                        description: err.message,
                    }),
                ),
            ),
        ),
    );
}
