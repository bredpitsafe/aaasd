import { useMemo } from 'react';

import type { TTimeZoneInfo } from '../../../types/time';
import { getUtcTimeZoneInfo } from '../../../utils/time';

export function useUtcTimeZoneInfo(): TTimeZoneInfo {
    return useMemo(() => getUtcTimeZoneInfo(), []);
}
