import { generateTraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef } from 'react';
import { of } from 'rxjs';

import { ModuleExportFullDashboard } from '../../../modules/actions/dashboards/exportFullDashboard.ts';
import { ModuleCloneDashboard } from '../../../modules/actions/modals/cloneDashboard.tsx';
import { ModuleClonePanelWithDashboardSelector } from '../../../modules/actions/modals/clonePanelWithDashboardSelector.tsx';
import { ModuleUI } from '../../../modules/ui/module';
import type { TPanel } from '../../../types/panel';
import type { TShareButtonProps } from '../../ShareButton/ShareButton';
import { ShareButton } from '../../ShareButton/ShareButton';

type TConnectedShareButtonProps = TShareButtonProps & {
    panel?: TPanel;
};

export const ConnectedExportButton = forwardRef(
    (props: TConnectedShareButtonProps, ref: ForwardedRef<HTMLElement>) => {
        const cloneDashboard = useModule(ModuleCloneDashboard);
        const exportFullDashboard = useModule(ModuleExportFullDashboard);
        const clonePanelWithDashboardSelector = useModule(ModuleClonePanelWithDashboardSelector);
        const { currentDashboardItemKey$ } = useModule(ModuleUI);

        const { panel, ...shareButtonProps } = props;

        const currentDashboardItemKey = useSyncObservable(currentDashboardItemKey$);

        const [cbExportDashboardFile] = useNotifiedObservableFunction(() => {
            return exportFullDashboard(undefined, { traceId: generateTraceId() });
        });

        const [cbCloneDashboard] = useNotifiedObservableFunction(() => {
            if (isNil(currentDashboardItemKey)) {
                return of(false);
            }
            return cloneDashboard(currentDashboardItemKey, { traceId: generateTraceId() });
        });

        const [cbClonePanel] = useNotifiedObservableFunction(() => {
            if (isNil(panel)) {
                return of(false);
            }
            return clonePanelWithDashboardSelector(panel, { traceId: generateTraceId() });
        });

        return (
            <ShareButton
                ref={ref}
                {...shareButtonProps}
                onCloneDashboard={
                    isNil(currentDashboardItemKey) || !isNil(panel) ? undefined : cbCloneDashboard
                }
                onExportDashboardFile={isNil(panel) ? cbExportDashboardFile : undefined}
                onClonePanel={isNil(panel) ? undefined : cbClonePanel}
            >
                {props.children}
            </ShareButton>
        );
    },
);
