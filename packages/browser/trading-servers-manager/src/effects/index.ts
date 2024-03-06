import type { TStatusMessage } from '@frontend/common/src/components/hooks/components/useStatusMessageHistory';
import type { TContextRef } from '@frontend/common/src/di';
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
import {
    ComponentMetadataType,
    ModuleComponentMetadata,
} from '@frontend/common/src/modules/componentMetadata';
import { ModuleGates } from '@frontend/common/src/modules/gates';
import { ModuleRobots } from '@frontend/common/src/modules/robots';
import { ModuleServers } from '@frontend/common/src/modules/servers';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { EApplicationName } from '@frontend/common/src/types/app';
import { EComponentType, TComponent } from '@frontend/common/src/types/domain/component';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { isRobot } from '@frontend/common/src/utils/domain/components';
import { progressiveRetry } from '@frontend/common/src/utils/Rx/progressiveRetry';
import { getNowMilliseconds } from '@frontend/common/src/utils/time';
import { merge } from 'rxjs';
import { filter, skip, switchMap } from 'rxjs/operators';

import { DEFAULT_LAYOUTS } from '../layouts';
import { routerEffects } from './router';
import { initUIEffects } from './ui';

export async function runAllEffects(ctx: TContextRef): Promise<void> {
    initContextUI(ctx);

    void initSocketListEffects(ctx);
    void initAuthentication(ctx);

    subscribeComponentUpdates(ctx);
    clearSavedDataOnSocketChange(ctx);

    initWorkerEffects(ctx);
    initUIEffects(ctx);
    initLayoutsEffects(ctx, DEFAULT_LAYOUTS, EApplicationName.TradingServersManager);
    initTableStatesEffects();
    initHTTPStatusEffect(ctx);
    initActorDataSourceStatusEffects(ctx);
    initSocketServerTimeEffects(ctx);
    initSettingsEffects(ctx, EApplicationName.TradingServersManager);

    void initTableFiltersEffects(ctx);

    routerEffects(ctx);

    saveStatusMessageHistory(ctx);
}

function subscribeComponentUpdates(ctx: TContextRef): void {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const { requestStream } = ModuleCommunicationHandlers(ctx);
    const { subscribeComponentUpdates } = ModuleBaseActions(ctx);
    const { upsertServers } = ModuleServers(ctx);
    const { upsertGates, enableGatesRemoval } = ModuleGates(ctx);
    const { upsertRobots, enableRobotsRemoval } = ModuleRobots(ctx);

    currentSocketUrl$
        .pipe(
            filter((url): url is TSocketURL => url !== undefined),
            switchMap((url) =>
                subscribeComponentUpdates(requestStream, url).pipe(
                    progressiveRetry({ initialInterval: 1_000 }),
                ),
            ),
        )
        .subscribe((payload) => {
            const { componentRemovalEnabled, servers, gates, robots } = payload;
            upsertServers(servers);
            upsertGates(gates);
            enableGatesRemoval(componentRemovalEnabled);
            upsertRobots(robots);
            enableRobotsRemoval(componentRemovalEnabled);
        });
}

function clearSavedDataOnSocketChange(ctx: TContextRef): void {
    const { currentSocketName$ } = ModuleCommunication(ctx);
    const { deleteServers } = ModuleServers(ctx);
    const { deleteGates } = ModuleGates(ctx);
    const { deleteRobots } = ModuleRobots(ctx);
    const { cleanComponentMetadata } = ModuleComponentMetadata(ctx);

    // Skip first socket as it's default one after page load.
    // We're only interested in subsequent socket changes without page reload.
    currentSocketName$.pipe(skip(1)).subscribe(() => {
        deleteServers();
        deleteGates();
        deleteRobots();
        cleanComponentMetadata();
    });
}

export function saveStatusMessageHistory(ctx: TContextRef): void {
    const { robots$ } = ModuleRobots(ctx);
    const { gates$ } = ModuleGates(ctx);
    const { setComponentMetadata, getComponentMetadata } = ModuleComponentMetadata(ctx);

    merge(robots$, gates$).subscribe((components) => {
        Object.values(components).forEach((component: TComponent) => {
            const { id } = component;
            // Robots don't have 'type' property, but gates do.
            const type = isRobot(component) ? EComponentType.robot : component.type;

            const history =
                getComponentMetadata<TStatusMessage[]>(
                    ComponentMetadataType.StatusMessageHistory,
                    type,
                    id,
                ) || [];

            // Push new statusMessage to component history when it's not empty and differs from the previous one
            if (
                component.statusMessage &&
                history[history.length - 1]?.message !== component.statusMessage
            ) {
                const message: TStatusMessage = {
                    componentId: id,
                    message: component.statusMessage,
                    timestamp: getNowMilliseconds(),
                };

                setComponentMetadata(ComponentMetadataType.StatusMessageHistory, type, id, [
                    ...history,
                    message,
                ]);
            }
        });
    });
}
