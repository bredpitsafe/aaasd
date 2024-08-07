import { EApplicationName } from '@common/types';
import { generateTraceId, getNowMilliseconds } from '@common/utils';
import { setupTabThread } from '@frontend/common/src/actors/utils/setupTabThread.ts';
import type { TStatusMessage } from '@frontend/common/src/components/hooks/components/useStatusMessageHistory';
import type { TContextRef } from '@frontend/common/src/di';
import { initActorDataSourceStatusEffects } from '@frontend/common/src/effects/actorDataSourceStatus';
import { initTableFiltersEffects } from '@frontend/common/src/effects/filters';
import { initApplicationName } from '@frontend/common/src/effects/initApplicationName';
import { initHTTPStatusEffect } from '@frontend/common/src/effects/initHTTPStatusEffect';
import { initLayoutsEffects } from '@frontend/common/src/effects/layouts';
import { initSettingsEffects } from '@frontend/common/src/effects/settings';
import { initSocketListEffects } from '@frontend/common/src/effects/socketList';
import { initSocketServerTimeEffects } from '@frontend/common/src/effects/socketServerTime';
import { initTableStatesEffects } from '@frontend/common/src/effects/tables';
import { ModuleSubscribeToComponentsSnapshot } from '@frontend/common/src/modules/actions/components/ModuleSubscribeToComponentsSnapshot.ts';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import {
    ComponentMetadataType,
    ModuleComponentMetadata,
} from '@frontend/common/src/modules/componentMetadata';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TComponent } from '@frontend/common/src/types/domain/component';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import { isRobot } from '@frontend/common/src/utils/domain/components';
import { ModuleNotifyErrorAndFail } from '@frontend/common/src/utils/Rx/ModuleNotify.ts';
import { extractSyncedValueFromValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { isNil } from 'lodash-es';
import { EMPTY } from 'rxjs';
import { skip, switchMap } from 'rxjs/operators';

import { DEFAULT_LAYOUTS } from '../layouts';
import { initComponentMetadataEffects } from './componentMetadata';
import { routerEffects } from './router';
import { initUIEffects } from './ui';

export async function runAllEffects(ctx: TContextRef): Promise<void> {
    initApplicationName(ctx, EApplicationName.TradingServersManager);

    void initSocketListEffects(ctx);

    clearSavedDataOnSocketChange(ctx);

    initSettingsEffects(ctx);
    initUIEffects(ctx);
    initLayoutsEffects(ctx, DEFAULT_LAYOUTS);
    initTableStatesEffects();
    initHTTPStatusEffect(ctx);
    initActorDataSourceStatusEffects(ctx);
    initSocketServerTimeEffects(ctx);
    initComponentMetadataEffects(ctx);

    void initTableFiltersEffects(ctx);

    routerEffects(ctx);

    saveStatusMessageHistory(ctx);
    setupTabThread(ctx);
}

function clearSavedDataOnSocketChange(ctx: TContextRef): void {
    const { currentSocketName$ } = ModuleCommunication(ctx);
    const { cleanComponentMetadata } = ModuleComponentMetadata(ctx);

    // Skip first socket as it's default one after page load.
    // We're only interested in subsequent socket changes without page reload.
    currentSocketName$.pipe(skip(1)).subscribe(() => {
        cleanComponentMetadata();
    });
}

export function saveStatusMessageHistory(ctx: TContextRef): void {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const { setComponentMetadata, getComponentMetadata } = ModuleComponentMetadata(ctx);
    const subscribeToComponentsSnapshot = ModuleSubscribeToComponentsSnapshot(ctx);
    const notifyErrorAndFail = ModuleNotifyErrorAndFail(ctx);

    currentSocketUrl$
        .pipe(
            switchMap((target) =>
                isNil(target)
                    ? EMPTY
                    : subscribeToComponentsSnapshot({ target }, { traceId: generateTraceId() }),
            ),
            notifyErrorAndFail(),
            extractSyncedValueFromValueDescriptor(),
        )
        .subscribe((components) => {
            [components.robots, components.gates].flat().forEach((component: TComponent) => {
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
