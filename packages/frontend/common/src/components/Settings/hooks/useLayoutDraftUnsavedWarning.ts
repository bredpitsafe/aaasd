import { ECommonSettings } from '../def';
import { useBooleanSettings } from './useBooleanSettings';

export const DEFAULT = true;
export function useLayoutDraftUnsavedWarning() {
    return useBooleanSettings('common', ECommonSettings.LayoutDraftUnsavedWarning, DEFAULT);
}
