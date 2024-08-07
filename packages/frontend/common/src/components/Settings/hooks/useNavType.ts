import { ENavType } from '../../../actors/Settings/types';
import { useAppName } from '../../../hooks/useAppName';
import { ECommonSettings } from '../def';
import { useSingleSettings } from './useSingleSettings';

const DEFAULT_VALUE = ENavType.Small;
export function useNavType() {
    const appName = useAppName();
    return useSingleSettings<ENavType>(appName, ECommonSettings.NavType, DEFAULT_VALUE);
}
