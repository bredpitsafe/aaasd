import { useModule } from '@frontend/common/src/di/react';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { ReactElement } from 'react';

import { Nav } from '../components/Nav/view';
import { ModuleOpenModalSettings } from '../modules/actions/modals/ModuleOpenModalSettings';

export type TConnectedNavProps = TWithClassname & {
    onResetLayout: () => void;
    onResetToSaved: () => void;
};

export function WidgetNav(props: TConnectedNavProps): ReactElement {
    const { upsertTabTask } = useModule(ModuleLayouts);
    const openModalSettings = useModule(ModuleOpenModalSettings);

    const cbAddCreateTaskTab = useFunction(() => upsertTabTask());

    return (
        <Nav {...props} openModalSettings={openModalSettings} onAddTaskTab={cbAddCreateTaskTab} />
    );
}
