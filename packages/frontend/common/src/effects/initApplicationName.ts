import type { EApplicationName } from '@common/types';

import type { TContextRef } from '../di';
import { ModuleApplicationName } from '../modules/applicationName';

export function initApplicationName(ctx: TContextRef, appName: EApplicationName) {
    const { setAppName } = ModuleApplicationName(ctx);
    setAppName(appName);
}
