import type { EApplicationName } from '@common/types';

import { useModule } from '../di/react';
import { ModuleSettings } from '../modules/settings';
import { useValueDescriptorObservable } from '../utils/React/useValueDescriptorObservable';

export function useAppSettings(appName: EApplicationName, key: string) {
    const { getAppSettings$ } = useModule(ModuleSettings);

    return useValueDescriptorObservable(getAppSettings$(appName, key), {
        valueSurviveLoading: true,
        valueSurviveCriticalFail: true,
    });
}
