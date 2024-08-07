import { useMapSettings } from '@frontend/common/src/components/Settings/hooks/useMapSettings';
import { useAppName } from '@frontend/common/src/hooks/useAppName';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';

import type { TPanelId } from '../../../types/panel';
import { EDashboardSettings } from '../def';

export function usePanelCollapsedSettings(panelId: TPanelId): [boolean, VoidFunction] {
    const appName = useAppName();
    const [collapsed, onChange] = useMapSettings<boolean>(
        appName,
        EDashboardSettings.PanelCollapsed,
        panelId,
        false,
    );

    const cbToggle = useFunction(() => onChange(!collapsed));

    return [collapsed, cbToggle];
}
