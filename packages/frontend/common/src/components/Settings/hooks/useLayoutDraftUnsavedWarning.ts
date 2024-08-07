import { EApplicationName } from '@common/types';

import { ECommonSettings } from '../def';
import { useBooleanSettings } from './useBooleanSettings';

export const DEFAULT = true;
export function useLayoutDraftUnsavedWarning() {
    return useBooleanSettings(
        EApplicationName.Common,
        ECommonSettings.LayoutDraftUnsavedWarning,
        DEFAULT,
    );
}
