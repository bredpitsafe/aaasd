import { Alert } from '@frontend/common/src/components/Alert';
import { ConnectedCustomViewTable } from '@frontend/common/src/components/CustomView/ConnectedCustomViewTable';
import { useModule } from '@frontend/common/src/di/react';
import type { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data.ts';
import { DYNAMIC_TABLE_NAME_PREFIX } from '@frontend/common/src/modules/clientTableFilters/data.ts';
import type { TDataSourceState } from '@frontend/common/src/modules/dataSourceStatus/defs';
import { ModuleDataSourceStatus } from '@frontend/common/src/modules/dataSourceStatus/module';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { transformDataSourcesStatesToClassName } from '@frontend/common/src/utils/dataSourceStatus';
import { hashString } from '@frontend/common/src/utils/hashString.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import {
    isFailValueDescriptor,
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import cn from 'classnames';
import { isEmpty, isNil } from 'lodash-es';
import { memo, useMemo } from 'react';
import { map } from 'rxjs/operators';

import { ModuleCustomView } from '../../../modules/customView/module';
import { ModuleDashboardRouter } from '../../../modules/router/module';
import type { TCustomViewTablePanel } from '../../../types/panel';
import { EDashboardRoutes } from '../../../types/router';
import { convertPanelTableConfigToXml } from '../../../utils/panels/converters.ts';

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

    const statusClassName = useMemo(
        () => transformDataSourcesStatesToClassName(dataSource),
        [dataSource],
    );

    const result = useSyncObservable(
        useMemo(
            () => getCustomViewTable(panel.table, panel.settings),
            [getCustomViewTable, panel.table, panel.settings],
        ),
    );

    const tableId = useMemo(() => {
        if (isNil(panel.table) || isEmpty(panel.table)) {
            return `${DYNAMIC_TABLE_NAME_PREFIX}CustomView` as ETableIds;
        }

        const xml = convertPanelTableConfigToXml(panel.table);

        return `${DYNAMIC_TABLE_NAME_PREFIX}CustomView_${hashString(xml)}` as ETableIds;
    }, [panel.table]);

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

    return isSyncedValueDescriptor(result) ? (
        <ConnectedCustomViewTable
            tableId={tableId}
            className={cn(statusClassName, className)}
            table={result.value}
            url={url}
            backtestingRunId={backtestingRunId}
        />
    ) : null;
});
