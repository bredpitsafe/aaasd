import { useSingleSettings } from '@frontend/common/src/components/Settings/hooks/useSingleSettings';
import { useAppName } from '@frontend/common/src/hooks/useAppName';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';

import type list from '../../../../../../../configs/dashboards.urls.json';
import { EDashboardSettings } from '../def';

const DEFAULT_VALUE: keyof typeof list = 'dashboards-prod';
export function useServiceStageName() {
    const appName = useAppName();
    return useSingleSettings(
        appName,
        EDashboardSettings.ServiceStage,
        DEFAULT_VALUE as TSocketName,
    );
}
