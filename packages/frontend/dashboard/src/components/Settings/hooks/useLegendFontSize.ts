import { useNumberSettings } from '@frontend/common/src/components/Settings/hooks/useNumberSettings';
import type { TUseSingleValueReturnType } from '@frontend/common/src/components/Settings/hooks/useSingleSettings';
import { useAppName } from '@frontend/common/src/hooks/useAppName';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState';
import { useRef } from 'react';

import { EDashboardSettings } from '../def';

const DEFAULT_VALUE = 14;
const DEFAULT_DEBOUNCE_TIME = 500;
export function useLegendFontSize(
    debounceTime = DEFAULT_DEBOUNCE_TIME,
): TUseSingleValueReturnType<number> {
    const appName = useAppName();
    const [fontSize, changeFontSize, clearFontSize, loading] = useNumberSettings(
        appName,
        EDashboardSettings.LegendFontSize,
        DEFAULT_VALUE,
    );
    const [value, setValue] = useSyncState(fontSize, [fontSize]);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateFontSize = useFunction((value: number) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setValue(value);

        timeoutRef.current = setTimeout(() => {
            changeFontSize(value);
        }, debounceTime);
    });

    return [value, updateFontSize, clearFontSize, loading];
}
