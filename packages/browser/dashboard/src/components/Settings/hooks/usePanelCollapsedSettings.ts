import { useMapSettings } from '@frontend/common/src/components/Settings/hooks/useMapSettings';
import { EApplicationName } from '@frontend/common/src/types/app';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';

import type { TPanelId } from '../../../types/panel';
import { EDashboardSettings } from '../def';

export function usePanelCollapsedSettings(panelId: TPanelId): [boolean, VoidFunction] {
    const [collapsed, onChange] = useMapSettings(
        EApplicationName.Dashboard,
        EDashboardSettings.PanelCollapsed,
        panelId,
        false,
    );

    const cbToggle = useFunction(() => onChange(!collapsed));

    return [collapsed, cbToggle];
}
