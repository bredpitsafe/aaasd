import { TContextRef } from '@frontend/common/src/di';
import { initActorDataSourceStatusEffects } from '@frontend/common/src/effects/actorDataSourceStatus';
import { initTableFiltersEffects } from '@frontend/common/src/effects/filters';
import { initContextUI } from '@frontend/common/src/effects/initContextUI';
import { initHTTPStatusEffect } from '@frontend/common/src/effects/initHTTPStatusEffect';
import { initAuthentication } from '@frontend/common/src/effects/keycloak';
import { initLayoutsEffects } from '@frontend/common/src/effects/layouts';
import { initSettingsEffects } from '@frontend/common/src/effects/settings';
import { initSocketListEffects } from '@frontend/common/src/effects/socketList';
import { initSocketServerTimeEffects } from '@frontend/common/src/effects/socketServerTime';
import { initTableStatesEffects } from '@frontend/common/src/effects/tables';
import { initWorkerEffects } from '@frontend/common/src/effects/worker';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import { ModuleCommunicationHandlers } from '@frontend/common/src/modules/communicationHandlers';
import { ModuleRobots } from '@frontend/common/src/modules/robots';
import { ModuleServers } from '@frontend/common/src/modules/servers';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { progressiveRetry } from '@frontend/common/src/utils/Rx/progressiveRetry';
import { saveStatusMessageHistory } from '@frontend/trading-servers-manager/src/effects';
import { filter, skip, switchMap } from 'rxjs/operators';

import { DEFAULT_LAYOUTS } from '../layouts';
import { routerEffects } from './router';

export async function runAllEffects(ctx: TContextRef): Promise<void> {
    initContextUI(ctx);

    void initSocketListEffects(ctx);
    void initAuthentication(ctx);

    subscribeComponentUpdates(ctx);
    initHTTPStatusEffect(ctx);
    initTableStatesEffects();
    initActorDataSourceStatusEffects(ctx);
    initSocketServerTimeEffects(ctx);
    initLayoutsEffects(ctx, DEFAULT_LAYOUTS, EApplicationName.HerodotusTerminal);
    clearSavedDataOnSocketChange(ctx);
    saveStatusMessageHistory(ctx);
    initSettingsEffects(ctx, EApplicationName.HerodotusTerminal);

    void initTableFiltersEffects(ctx);

    routerEffects(ctx);
    initWorkerEffects(ctx);
}

function subscribeComponentUpdates(ctx: TContextRef): void {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const { requestStream } = ModuleCommunicationHandlers(ctx);
    const { subscribeComponentUpdates } = ModuleBaseActions(ctx);
    const { upsertServers } = ModuleServers(ctx);
    const { upsertRobots, setLoading } = ModuleRobots(ctx);

    currentSocketUrl$
        .pipe(
            filter((url): url is TSocketURL => url !== undefined),
            switchMap((url) => {
                setLoading(true);
                return subscribeComponentUpdates(requestStream, url).pipe(
                    progressiveRetry({ initialInterval: 1_000 }),
                );
            }),
        )
        .subscribe((payload) => {
            upsertServers(payload.servers);
            upsertRobots(payload.robots);
            setLoading(false);
        });
}

function clearSavedDataOnSocketChange(ctx: TContextRef): void {
    const { currentSocketName$ } = ModuleCommunication(ctx);
    const { deleteServers } = ModuleServers(ctx);
    const { deleteRobots } = ModuleRobots(ctx);

    // Skip first socket as it's default one after page load.
    // We're only interested in subsequent socket changes without page reload.
    currentSocketName$.pipe(skip(1)).subscribe(() => {
        deleteServers();
        deleteRobots();
    });
}
