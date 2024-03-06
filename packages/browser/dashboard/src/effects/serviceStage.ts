import type { TContextRef } from '@frontend/common/src/di';
import { loadConfig } from '@frontend/common/src/effects/socketList';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import { EApplicationName } from '@frontend/common/src/types/app';
import { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { assert } from '@frontend/common/src/utils/assert';
import { isEqual, isNil } from 'lodash-es';
import { combineLatest, distinctUntilChanged } from 'rxjs';
import { tap } from 'rxjs/operators';

import { EDashboardSettings } from '../components/Settings/def';
import { ModuleServiceStage } from '../modules/serviceStage';

export function initServiceStageListEffects(ctx: TContextRef) {
    const { setStages, currentStage$, setCurrentStageName } = ModuleServiceStage(ctx);
    const { setAppSettings, getAppSettings$ } = ModuleSettings(ctx);

    combineLatest([
        loadConfig('dashboards.urls.json').pipe(tap(setStages)),
        getAppSettings$<TSocketName>(EApplicationName.Dashboard, EDashboardSettings.ServiceStage),
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

    currentStage$.subscribe((currentStage) => {
        setAppSettings(
            EApplicationName.Dashboard,
            EDashboardSettings.ServiceStage,
            currentStage.name,
        );
    });
}
