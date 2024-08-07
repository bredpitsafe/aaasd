import { Alert } from '@frontend/common/src/components/Alert';
import { ConnectedCustomViewGrid } from '@frontend/common/src/components/CustomView/ConnectedCustomViewGrid';
import { useModule } from '@frontend/common/src/di/react';
import type { TDataSourceState } from '@frontend/common/src/modules/dataSourceStatus/defs';
import { ModuleDataSourceStatus } from '@frontend/common/src/modules/dataSourceStatus/module';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { EApplicationOwner } from '@frontend/common/src/utils/CustomView/defs';
import { transformDataSourcesStatesToClassName } from '@frontend/common/src/utils/dataSourceStatus';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import {
    isFailValueDescriptor,
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';
import { map } from 'rxjs/operators';

import { ModuleCustomView } from '../../../modules/customView/module';
import { ModuleDashboardRouter } from '../../../modules/router/module';
import type { TCustomViewGridPanel } from '../../../types/panel';
import { EDashboardRoutes } from '../../../types/router';

type TConnectedProps = TWithClassname & {
    panel: TCustomViewGridPanel;
};

export const ConnectedIndicatorsGrid = memo(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ className, panel }: TConnectedProps) => {
        const { state$ } = useModule(ModuleDashboardRouter);
        const { getDataSources$ } = useModule(ModuleDataSourceStatus);
        const { getCustomViewGrid } = useModule(ModuleCustomView);

        const { url } = panel.settings;
        const backtestingRunId = useSyncObservable(
            useMemo(
                () =>
                    state$.pipe(
                        map(({ route }) =>
                            route.name === EDashboardRoutes.Dashboard
                                ? route.params.backtestingId
                                : undefined,
                        ),
                    ),
                [state$],
            ),
        );

        const dataSource = useSyncObservable(
            useMemo(() => getDataSources$([url]), [getDataSources$, url]),
            EMPTY_ARRAY as TDataSourceState[],
        );

        const statusClassName = useMemo(
            () => transformDataSourcesStatesToClassName(dataSource),
            [dataSource],
        );

        const result = useSyncObservable(
            useMemo(
                () => getCustomViewGrid(panel.grid, panel.settings),
                [getCustomViewGrid, panel.grid, panel.settings],
            ),
        );

        if (isNil(result) || isLoadingValueDescriptor(result)) {
            return <Alert message="Loading Grid configuration" type="info" closable={false} />;
        }

        if (isFailValueDescriptor(result)) {
            const { code, meta } = result.fail;
            switch (code) {
                case EGrpcErrorCode.FAILED_PRECONDITION:
                    return (
                        <Alert
                            message="Empty Grid configuration"
                            description="Check configuration, all tags and attributes should be in low case"
                            type="warning"
                            closable={false}
                        />
                    );
                case EGrpcErrorCode.INVALID_ARGUMENT:
                    return (
                        <Alert
                            message="Grid configuration parse error"
                            description="Check configuration, all tags and attributes should be in low case"
                            type="error"
                            closable={false}
                        />
                    );
                default:
                    return (
                        <Alert
                            message={meta.message}
                            description={meta.description}
                            type="error"
                            closable={false}
                        />
                    );
            }
        }

        return isSyncedValueDescriptor(result) ? (
            <ConnectedCustomViewGrid
                className={cn(statusClassName, className)}
                grid={result.value}
                owner={EApplicationOwner.Dashboard}
                url={url}
                backtestingRunId={backtestingRunId}
            />
        ) : null;
    },
);
