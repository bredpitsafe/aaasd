import { EApplicationName } from '@common/types';

import { ECommonSettings } from '../def';
import { useBooleanSettings } from './useBooleanSettings';

export const DEFAULT_SYNC_LAYOUTS = true;
export function useSyncLayouts() {
    return useBooleanSettings(
        EApplicationName.Common,
        ECommonSettings.SyncLayouts,
        DEFAULT_SYNC_LAYOUTS,
    );
}
