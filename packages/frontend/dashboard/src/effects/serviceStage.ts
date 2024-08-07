import { assert } from '@common/utils/src/assert.ts';
import type { TContextRef } from '@frontend/common/src/di';
import { loadConfig } from '@frontend/common/src/effects/socketList';
import { ModuleApplicationName } from '@frontend/common/src/modules/applicationName';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { extractSyncedValueFromValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { isEqual, isNil } from 'lodash-es';
import { combineLatest, distinctUntilChanged } from 'rxjs';
import { tap } from 'rxjs/operators';

import { EDashboardSettings } from '../components/Settings/def';
import { ModuleServiceStage } from '../modules/serviceStage';

export function initServiceStageListEffects(ctx: TContextRef) {
    const { setStages, setCurrentStageName } = ModuleServiceStage(ctx);
    const { getAppSettings$ } = ModuleSettings(ctx);
    const { appName } = ModuleApplicationName(ctx);

    combineLatest([
        loadConfig('dashboards.urls.json').pipe(tap(setStages)),
        getAppSettings$(appName, EDashboardSettings.ServiceStage).pipe(
            extractSyncedValueFromValueDescriptor(),
        ),
    ])
        .pipe(distinctUntilChanged(isEqual))
        .subscribe(([stages, currentStage]) => {
            if (isNil(currentStage)) {
                const stagesList = Object.keys(stages);
                assert(
                    stagesList.length > 0,
                    'Dashboard stages list is empty, cannot set default service stage',
                );
                setCurrentStageName(stagesList[0] as TSocketName);
                return;
            }
            setCurrentStageName(currentStage);
        });
}
