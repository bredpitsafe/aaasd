import type { TSettingsStoreName } from '../../../actors/Settings/db';
import { TUseSingleValueReturnType, useSingleSettings } from './useSingleSettings';

export function useNumberSettings(
    appName: TSettingsStoreName,
    key: string,
    defaultValue = 0,
): TUseSingleValueReturnType<number> {
    return useSingleSettings<number>(appName, key, defaultValue);
}
