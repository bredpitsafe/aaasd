import { ComponentsDraftUnsavedWarning } from '@frontend/common/src/components/Settings/components/ComponentsDraftUnsavedWarning.tsx';
import { TimeZoneSelector } from '@frontend/common/src/components/Settings/components/TimeZoneSelector.tsx';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { ReactElement } from 'react';

import { Nav } from '../components/Nav/view';
import { WidgetNotificationPermissions } from './Settings/WidgetNotificationPermissions.tsx';

export type TConnectedNavProps = TWithClassname & {
    onResetLayout: VoidFunction;
    onResetToSaved: VoidFunction;
};

export function WidgetNav(props: TConnectedNavProps): ReactElement {
    const { upsertTabTask } = useModule(ModuleLayouts);
    const { openModalSettings } = useModule(ModuleSettings);

    const handleOpenModalSettings = useFunction(() => {
        openModalSettings({
            children: (
                <>
                    <WidgetNotificationPermissions />
                    <ComponentsDraftUnsavedWarning />
                    <TimeZoneSelector extendTimeZoneList />
                </>
            ),
        });
    });

    const cbAddCreateTaskTab = useFunction(() => upsertTabTask());

    return (
        <Nav
            {...props}
            openModalSettings={handleOpenModalSettings}
            onAddTaskTab={cbAddCreateTaskTab}
        />
    );
}
