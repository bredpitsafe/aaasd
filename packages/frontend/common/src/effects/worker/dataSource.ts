import { filter, lastValueFrom, map, take, tap } from 'rxjs';

import { TContextRef } from '../../di';
import {
    EDataSourceLevel,
    EDataSourceStatus,
    EDataSourceType,
    TDataSourceLog,
} from '../../modules/dataSourceStatus/defs';
import { ModuleDataSourceStatus } from '../../modules/dataSourceStatus/module';
import { getNowMilliseconds } from '../../utils/time';

const NAME = 'Shared Worker';

export const dataSourceSetter = (ctx: TContextRef) => {
    const dataSource = ModuleDataSourceStatus(ctx);
    const setStatus = (log: TDataSourceLog) =>
        lastValueFrom(
            dataSource.getDataSource$(NAME).pipe(
                take(1),
                filter((current) => current.status !== log.status || current.level !== log.level),
                tap(() => dataSource.changeDataSourceStatus(NAME, log)),
                map(() => undefined),
            ),
            { defaultValue: undefined },
        );

    return {
        register: () => {
            dataSource.addDataSource(EDataSourceType.Worker, NAME, '/', {
                level: EDataSourceLevel.Info,
                status: EDataSourceStatus.Unknown,
                message: 'Register Shared Worker',
                timestamp: getNowMilliseconds(),
            });
        },
        unknown: () =>
            setStatus({
                level: EDataSourceLevel.Info,
                status: EDataSourceStatus.Unknown,
                message: 'Check worker status',
                timestamp: getNowMilliseconds(),
            }),
        stable: () =>
            setStatus({
                level: EDataSourceLevel.Success,
                status: EDataSourceStatus.Stable,
                message: 'Worker online',
                timestamp: getNowMilliseconds(),
            }),
        error: () =>
            setStatus({
                level: EDataSourceLevel.Error,
                status: EDataSourceStatus.Disconnected,
                message: 'Worker is not responding',
                timestamp: getNowMilliseconds(),
            }),
    };
};
