import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { ConnectedNav } from '@frontend/common/src/components/Nav';
import type { TNavChildRenderFunction } from '@frontend/common/src/components/Nav/view';
import { cnSection, cnSectionFill } from '@frontend/common/src/components/Nav/view.css';
import type { TWithClassname } from '@frontend/common/src/types/components';
import cn from 'classnames';
import type { ReactElement } from 'react';
import { useCallback } from 'react';

import { WidgetComponentStatuses } from '../../widgets/WidgetComponentStatuses';
import { WidgetLayoutAdditionalControls } from '../../widgets/WidgetLayoutAdditionalControls';
import { WidgetLayoutSelector } from '../../widgets/WidgetLayoutSelector';
import { WidgetPumpAndDump } from '../../widgets/WidgetPumpAndDump';
import { cnComponentStatuses, cnNewManualTransfer } from './view.css';

export function Nav({
    className,
    components,
    onOpenModalSettings,
    onResetLayout,
    onResetToSaved,
}: TWithClassname & {
    components: string[];
    onOpenModalSettings: VoidFunction;
    onResetLayout: VoidFunction;
    onResetToSaved: VoidFunction;
}): ReactElement {
    const cbChildren = useNavChildrenRender();

    return (
        <ConnectedNav
            flexLayoutControls
            appSwitchControls
            stageSwitchControls
            timeZoneIndicator
            layoutComponents={components}
            className={className}
            onOpenModalSettings={onOpenModalSettings}
            onResetLayout={onResetLayout}
            onResetToSavedLayout={onResetToSaved}
        >
            {cbChildren}
        </ConnectedNav>
    );
}

function useNavChildrenRender(): TNavChildRenderFunction {
    return useCallback(({ type, collapsed }) => {
        if (type === ENavType.Hidden) {
            return (
                <>
                    <WidgetLayoutSelector type={type} />
                </>
            );
        }

        return (
            <>
                <div className={cnSection}>
                    <WidgetLayoutSelector type={type} />
                </div>

                <WidgetLayoutAdditionalControls
                    className={cn(cnSection, cnNewManualTransfer)}
                    type={type}
                />

                <WidgetComponentStatuses className={cnComponentStatuses} collapsed={collapsed} />

                <WidgetPumpAndDump className={cnSection} collapsed={collapsed} />

                <div className={cnSectionFill} />
            </>
        );
    }, []);
}
