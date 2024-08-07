import type { EApplicationName } from '@common/types';

import { useModule } from '../di/react';
import { ModuleApplicationName } from '../modules/applicationName';

export function useAppName(): EApplicationName {
    const { appName } = useModule(ModuleApplicationName);
    return appName;
}
