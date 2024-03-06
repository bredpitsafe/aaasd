import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import { EApplicationName } from '@frontend/common/src/types/app';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { ReactElement } from 'react';

import { Nav } from '../../Nav/view';
import { AppSettings } from '../../Settings/AppSettings';

type TConnectedNavProps = {
    onResetLayout: VoidFunction;
};

export function ConnectedNav(props: TConnectedNavProps): ReactElement {
    const { upsertTabTask, dropDraft } = useModule(ModuleLayouts);

    const cbAddCreateTaskTab = useFunction(() => {
        upsertTabTask();
    });

    const { openModalSettings } = useModule(ModuleSettings);
    const cbOpenModalSettings = useFunction(() => {
        openModalSettings({
            children: <AppSettings />,
            settingsStoreName: EApplicationName.HerodotusTerminal,
        });
    });

    const [timeZoneInfo] = useTimeZoneInfoSettings(EApplicationName.HerodotusTerminal);

    return (
        <Nav
            onAddTaskTab={cbAddCreateTaskTab}
            onResetLayout={props.onResetLayout}
            onResetToSaved={dropDraft}
            openModalSettings={cbOpenModalSettings}
            timeZoneInfo={timeZoneInfo}
        />
    );
}
