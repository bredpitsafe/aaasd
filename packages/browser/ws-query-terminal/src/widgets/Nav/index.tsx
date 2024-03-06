import { ConnectedStageSwitch } from '@frontend/common/src/components/connectedComponents/ConnectedStageSwitch';
import { Divider } from '@frontend/common/src/components/Divider';
import { LayoutReset } from '@frontend/common/src/components/LayoutReset';
import { ConnectedNav } from '@frontend/common/src/components/Nav';
import { cnDivider, cnSection, cnSectionFill } from '@frontend/common/src/components/Nav/view.css';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import { EApplicationName } from '@frontend/common/src/types/app';
import { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { LayoutDraftSaver } from '@frontend/common/src/widgets/LayoutDraftSaver';
import { ReactElement } from 'react';

import { ELayoutIds } from '../../layouts';
import { AuthTokenCopier } from '../AuthTokenCopier';

const APP_NAME = EApplicationName.WSQueryTerminal;

type TProps = TWithClassname;

export function Nav(props: TProps): ReactElement {
    const { openModalSettings } = useModule(ModuleSettings);
    const { dropDraft, dropLayout } = useModule(ModuleLayouts);

    const cbOpenModalSettings = useFunction(() =>
        openModalSettings({
            children: null,
            settingsStoreName: APP_NAME,
        }),
    );

    const resetLayoutToDefault = useFunction(() => void dropLayout(ELayoutIds.Terminal));

    return (
        <ConnectedNav
            appName={APP_NAME}
            className={props.className}
            onOpenModalSettings={cbOpenModalSettings}
        >
            {({ collapsed }: { collapsed: boolean }) => (
                <>
                    <div className={cnSection}>
                        <AuthTokenCopier size="middle" type={collapsed ? 'icon' : 'icon-label'} />
                    </div>
                    <div className={cnSectionFill} />
                    <div className={cnSection}>
                        <LayoutDraftSaver size="middle" type={collapsed ? 'icon' : 'icon-label'} />
                        <LayoutReset
                            onResetToDefault={resetLayoutToDefault}
                            onResetToSaved={dropDraft}
                            size="middle"
                            type={collapsed ? 'icon' : 'icon-label'}
                        />
                        <Divider type="horizontal" className={cnDivider} />
                        <ConnectedStageSwitch
                            size="middle"
                            type={collapsed ? 'icon' : 'icon-label'}
                            settingsStoreName={EApplicationName.WSQueryTerminal}
                        />
                    </div>
                </>
            )}
        </ConnectedNav>
    );
}
