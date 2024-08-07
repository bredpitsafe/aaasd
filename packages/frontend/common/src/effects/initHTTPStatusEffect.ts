import { getNowMilliseconds } from '@common/utils';
import { skipWhile } from 'rxjs';

import type { TContextRef } from '../di';
import {
    EDataSourceLevel,
    EDataSourceStatus,
    EDataSourceType,
} from '../modules/dataSourceStatus/defs';
import { ModuleDataSourceStatus } from '../modules/dataSourceStatus/module';
import { ModuleNetworkStatus } from '../modules/networkStatus/module';

export function initHTTPStatusEffect(ctx: TContextRef): VoidFunction {
    const dataSourceStatus = ModuleDataSourceStatus(ctx);
    const { online$ } = ModuleNetworkStatus(ctx);

    const name = 'HTTP';
    const onOnline = () => {
        dataSourceStatus.changeDataSourceStatus(name, {
            level: EDataSourceLevel.Success,
            message: 'Tab online',
            status: EDataSourceStatus.Stable,
            timestamp: getNowMilliseconds(),
        });
    };
    const onOffline = () => {
        dataSourceStatus.changeDataSourceStatus(name, {
            level: EDataSourceLevel.Error,
            status: EDataSourceStatus.Disconnected,
            message: 'Tab offline',
            timestamp: getNowMilliseconds(),
        });
    };

    dataSourceStatus.addDataSource(EDataSourceType.HTTP, name, '/', {
        level: EDataSourceLevel.Info,
        status: EDataSourceStatus.Unknown,
        message: 'Register network',
        timestamp: getNowMilliseconds(),
    });

    const subscription = online$
        // First status will always be `Offline` (till we make first request), so skip it.
        .pipe(skipWhile((value) => value !== true))
        .subscribe((status) => (status ? onOnline() : onOffline()));

    return () => subscription.unsubscribe();
}
