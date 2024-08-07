import { useAppName } from '../../../hooks/useAppName';
import { ECommonSettings } from '../def';
import { useBooleanSettings } from './useBooleanSettings';

export const DEFAULT = true;
export function useComponentsMetadataDraftUnsavedWarning() {
    const appName = useAppName();
    return useBooleanSettings(
        appName,
        ECommonSettings.ComponentsMetadataDraftUnsavedWarning,
        DEFAULT,
    );
}
