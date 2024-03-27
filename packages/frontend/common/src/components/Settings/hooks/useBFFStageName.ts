import { useSingleSettings } from '@frontend/common/src/components/Settings/hooks/useSingleSettings';

import { commonSettingsStoreName } from '../../../actors/Settings/db.ts';
import { BFF_PROD_SOCKET_NAME } from '../../../modules/bff/data.ts';
import { ECommonSettings } from '../def.ts';

export function useBFFStageName() {
    return useSingleSettings(
        commonSettingsStoreName,
        ECommonSettings.BFFServiceStage,
        BFF_PROD_SOCKET_NAME,
    );
}
