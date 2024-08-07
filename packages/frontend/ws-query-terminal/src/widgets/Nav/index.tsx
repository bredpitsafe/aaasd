import type { TConnectedNavProps } from '@frontend/common/src/components/Nav';
import { ConnectedNav } from '@frontend/common/src/components/Nav';
import { cnSection, cnSectionFill } from '@frontend/common/src/components/Nav/view.css';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { ReactElement } from 'react';

import { ELayoutIds } from '../../layouts';
import { AuthTokenCopier } from '../AuthTokenCopier';

type TProps = TWithClassname & Pick<TConnectedNavProps, 'timeZoneIndicator'>;

export function Nav({ className, timeZoneIndicator = true }: TProps): ReactElement {
    const { openModalSettings } = useModule(ModuleSettings);
    const { dropDraft, dropLayout } = useModule(ModuleLayouts);

    const cbOpenModalSettings = useFunction(() =>
        openModalSettings({
            children: null,
        }),
    );

    const resetLayoutToDefault = useFunction(() => void dropLayout(ELayoutIds.Terminal));

    return (
        <ConnectedNav
            flexLayoutControls
            appSwitchControls
            stageSwitchControls
            timeZoneIndicator={timeZoneIndicator}
            className={className}
            onOpenModalSettings={cbOpenModalSettings}
            onResetLayout={resetLayoutToDefault}
            onResetToSavedLayout={dropDraft}
            keepRestParams
        >
            {({ collapsed }: { collapsed: boolean }) => (
                <>
                    <div className={cnSection}>
                        <AuthTokenCopier size="middle" type={collapsed ? 'icon' : 'icon-label'} />
                    </div>
                    <div className={cnSectionFill} />
                </>
            )}
        </ConnectedNav>
    );
}
