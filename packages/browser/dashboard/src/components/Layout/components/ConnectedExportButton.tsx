import { useModule } from '@frontend/common/src/di/react';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef } from 'react';

import { ModuleDashboardActions } from '../../../modules/actions';
import { ModuleUI } from '../../../modules/ui/module';
import type { TPanel } from '../../../types/panel';
import type { TShareButtonProps } from '../../ShareButton/ShareButton';
import { ShareButton } from '../../ShareButton/ShareButton';

type TConnectedShareButtonProps = TShareButtonProps & {
    panel?: TPanel;
};

export const ConnectedExportButton = forwardRef(
    (props: TConnectedShareButtonProps, ref: ForwardedRef<HTMLElement>) => {
        const { exportFullDashboard, clonePanelWithDashboardSelector, cloneDashboard } =
            useModule(ModuleDashboardActions);
        const { currentDashboardItemKey$ } = useModule(ModuleUI);

        const { panel, ...shareButtonProps } = props;

        const currentDashboardItemKey = useSyncObservable(currentDashboardItemKey$);

        const cbExportDashboardFile = useFunction(async (): Promise<void> => {
            await exportFullDashboard();
        });

        const cbCloneDashboard = useFunction(async () => {
            if (isNil(currentDashboardItemKey)) {
                return;
            }

            await cloneDashboard(currentDashboardItemKey, generateTraceId());
        });

        const cbClonePanel = useFunction(async () => {
            if (isNil(panel)) {
                return;
            }

            await clonePanelWithDashboardSelector(generateTraceId(), panel);
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
