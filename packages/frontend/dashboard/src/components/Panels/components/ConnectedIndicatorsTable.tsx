import { Alert } from '@frontend/common/src/components/Alert';
import { ConnectedCustomViewTable } from '@frontend/common/src/components/CustomView/ConnectedCustomViewTable';
import { useModule } from '@frontend/common/src/di/react';
import type { TDataSourceState } from '@frontend/common/src/modules/dataSourceStatus/defs';
import { ModuleDataSourceStatus } from '@frontend/common/src/modules/dataSourceStatus/module';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError.ts';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { EApplicationOwner } from '@frontend/common/src/utils/CustomView/defs';
import { transformDataSourcesStatesToColor } from '@frontend/common/src/utils/dataSourceStatus';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import {
    isFailValueDescriptor,
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Properties } from 'csstype';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';
import { map } from 'rxjs/operators';

import { ModuleCustomView } from '../../../modules/customView/module';
import { ModuleDashboardRouter } from '../../../modules/router/module';
import type { TCustomViewTablePanel } from '../../../types/panel';
import { EDashboardRoutes } from '../../../types/router';

type TConnectedProps = TWithClassname & {
    panel: TCustomViewTablePanel;
};

export const ConnectedIndicatorsTable = memo(({ className, panel }: TConnectedProps) => {
    const { state$ } = useModule(ModuleDashboardRouter);
    const { getDataSources$ } = useModule(ModuleDataSourceStatus);
    const { getCustomViewTable } = useModule(ModuleCustomView);

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

    const statusStyle: Properties | undefined = useMemo(() => {
        const backgroundColor = transformDataSourcesStatesToColor(dataSource);

        if (isNil(backgroundColor)) {
            return undefined;
        }

        return { backgroundColor };
    }, [dataSource]);

    const result = useSyncObservable(
        useMemo(
            () => getCustomViewTable(panel.table, panel.settings),
            [getCustomViewTable, panel.table, panel.settings],
        ),
    );

    if (isNil(result) || isLoadingValueDescriptor(result)) {
        return <Alert message="Loading Table configuration" type="info" closable={false} />;
    }

    if (isFailValueDescriptor(result)) {
        const { code, meta } = result.fail;
        switch (code) {
            case EGrpcErrorCode.FAILED_PRECONDITION:
                return (
                    <Alert
                        message="Empty Table configuration"
                        description="Check configuration, all tags and attributes should be in low case"
                        type="warning"
                        closable={false}
                    />
                );
            case EGrpcErrorCode.INVALID_ARGUMENT:
                return (
                    <Alert
                        message="Table configuration parse error"
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

    if (isSyncedValueDescriptor(result)) {
        return (
            <ConnectedCustomViewTable
                className={className}
                statusStyle={statusStyle}
                table={result.value}
                owner={EApplicationOwner.Dashboard}
                url={url}
                backtestingRunId={backtestingRunId}
            />
        );
    }

    return null;
});
