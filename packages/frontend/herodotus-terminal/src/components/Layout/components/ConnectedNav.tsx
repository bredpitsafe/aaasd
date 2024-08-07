import { TimeZoneSelector } from '@frontend/common/src/components/Settings/components/TimeZoneSelector.tsx';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { ReactElement } from 'react';

import { Nav } from '../../Nav/view';

export function ConnectedNav({ onResetLayout }: { onResetLayout: VoidFunction }): ReactElement {
    const { upsertTabTask, dropDraft } = useModule(ModuleLayouts);

    const cbAddCreateTaskTab = useFunction(() => {
        upsertTabTask();
    });

    const { openModalSettings } = useModule(ModuleSettings);
    const cbOpenModalSettings = useFunction(() => {
        openModalSettings({
            children: (
                <>
                    <TimeZoneSelector extendTimeZoneList />
                </>
            ),
        });
    });

    const [timeZoneInfo] = useTimeZoneInfoSettings();

    return (
        <Nav
            onAddTaskTab={cbAddCreateTaskTab}
            openModalSettings={cbOpenModalSettings}
            timeZoneInfo={timeZoneInfo}
            onResetLayout={onResetLayout}
            onResetToSaved={dropDraft}
        />
    );
}
