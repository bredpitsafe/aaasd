import type { TSettingsStoreName } from '../../../actors/Settings/db';
import { ENavType } from '../../../actors/Settings/types';
import { ECommonSettings } from '../def';
import { useSingleSettings } from './useSingleSettings';

const DEFAULT_VALUE = ENavType.Small;
export function useNavType(appName: TSettingsStoreName) {
    return useSingleSettings<ENavType>(appName, ECommonSettings.NavType, DEFAULT_VALUE);
}
