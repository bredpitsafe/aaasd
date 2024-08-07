import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { map } from 'rxjs/operators';

import { useModule } from '../../di/react';
import type { TDataSourceState } from '../../modules/dataSourceStatus/defs';
import { EDataSourceLevel, EDataSourceStatus } from '../../modules/dataSourceStatus/defs';
import { ModuleDataSourceStatus } from '../../modules/dataSourceStatus/module';
import { EMPTY_ARRAY } from '../../utils/const';
import { useSyncObservable } from '../../utils/React/useSyncObservable.ts';
import type { TNetworkStatusProps } from '../DataSourceStatus/DataSourceStatus';
import { DataSourceStatus } from '../DataSourceStatus/DataSourceStatus';

export function ConnectedNetworkStatus(
    props: Pick<TNetworkStatusProps, 'badgeClassName'>,
): ReactElement | null {
    const { dataSourceList$ } = useModule(ModuleDataSourceStatus);

    const dataSources = useSyncObservable(
        useMemo(() => dataSourceList$.pipe(map(filterManualClosed)), [dataSourceList$]),
        EMPTY_ARRAY,
    );

    return <DataSourceStatus {...props} dataSources={dataSources} />;
}

function filterManualClosed(sources: TDataSourceState[]) {
    return sources.filter(
        (v) => !(v.status === EDataSourceStatus.Disconnected && v.level === EDataSourceLevel.Info),
    );
}
