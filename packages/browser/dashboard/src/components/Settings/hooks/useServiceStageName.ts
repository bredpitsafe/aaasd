import { useSingleSettings } from '@frontend/common/src/components/Settings/hooks/useSingleSettings';
import { EApplicationName } from '@frontend/common/src/types/app';
import { TSocketName } from '@frontend/common/src/types/domain/sockets';

import list from '../../../../../../../configs/dashboards.urls.json';
import { EDashboardSettings } from '../def';

const DEFAULT_VALUE: keyof typeof list = 'dashboards-prod';
export function useServiceStageName() {
    return useSingleSettings(
        EApplicationName.Dashboard,
        EDashboardSettings.ServiceStage,
        DEFAULT_VALUE as TSocketName,
    );
}
