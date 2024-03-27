import { ReactElement, useMemo } from 'react';
import { useObservable } from 'react-use';
import { map } from 'rxjs/operators';

import { useModule } from '../../di/react';
import {
    EDataSourceLevel,
    EDataSourceStatus,
    TDataSourceState,
} from '../../modules/dataSourceStatus/defs';
import { ModuleDataSourceStatus } from '../../modules/dataSourceStatus/module';
import { EMPTY_ARRAY } from '../../utils/const';
import { DataSourceStatus, TNetworkStatusProps } from '../DataSourceStatus/DataSourceStatus';

export function ConnectedNetworkStatus(
    props: Pick<TNetworkStatusProps, 'badgeClassName'>,
): ReactElement | null {
    const { dataSourceList$ } = useModule(ModuleDataSourceStatus);

    const dataSources = useObservable(
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
