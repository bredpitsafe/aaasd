import type { EApplicationName } from '@common/types';

import type { TUseSingleValueReturnType } from './useSingleSettings';
import { useSingleSettings } from './useSingleSettings';

export function useNumberSettings(
    appName: EApplicationName,
    key: string,
    defaultValue = 0,
): TUseSingleValueReturnType<number> {
    return useSingleSettings<number>(appName, key, defaultValue);
}
