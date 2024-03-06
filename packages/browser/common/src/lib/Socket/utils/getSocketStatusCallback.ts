import { TContextRef } from '../../../di';
import {
    EDataSourceLevel,
    EDataSourceStatus,
    EDataSourceType,
    TDataSourceLog,
    TDataSourceName,
} from '../../../modules/dataSourceStatus/defs';
import { ModuleDataSourceStatus } from '../../../modules/dataSourceStatus/module';
import type { TSocketURL } from '../../../types/domain/sockets';
import { getNowMilliseconds } from '../../../utils/time';
import {
    ESocketStatus,
    EUpdateReason,
    TSocketStatusUpdate,
} from '../../BFFSocket/plugins/SocketStatusPlugin';

export function getSocketStatusCallback(ctx: TContextRef, name: TDataSourceName, url: TSocketURL) {
    const { addDataSource, changeDataSourceStatus } = ModuleDataSourceStatus(ctx);

    return ({ status, reason }: TSocketStatusUpdate) => {
        if (reason === EUpdateReason.Opened) {
            return addDataSource(EDataSourceType.WS, name, url, getOpenedLog());
        }

        const log = getLog(status, reason);

        log && changeDataSourceStatus(name, log);
    };
}

function getLog(status: ESocketStatus, reason: EUpdateReason): undefined | TDataSourceLog {
    if (reason === EUpdateReason.Closed) return getCloseLog();
    if (reason === EUpdateReason.Failed) return getFailedLog();
    if (reason === EUpdateReason.Destroyed) return getDestroyedLog();

    if (status === ESocketStatus.Stable) return getStableLog();
    if (status === ESocketStatus.Unstable) return getUnstableLog();
}

function getOpenedLog() {
    return {
        level: EDataSourceLevel.Info,
        status: EDataSourceStatus.Stable,
        message: `Socket opened`,
        timestamp: getNowMilliseconds(),
    };
}

function getCloseLog() {
    return {
        level: EDataSourceLevel.Error,
        status: EDataSourceStatus.Disconnected,
        message: `Socket closed`,
        timestamp: getNowMilliseconds(),
    };
}

function getFailedLog() {
    return {
        level: EDataSourceLevel.Error,
        status: EDataSourceStatus.Disconnected,
        message: 'Socket failed',
        timestamp: getNowMilliseconds(),
    };
}

function getDestroyedLog() {
    return {
        level: EDataSourceLevel.Info,
        status: EDataSourceStatus.Disconnected,
        message: 'Socket destroyed',
        timestamp: getNowMilliseconds(),
    };
}

function getStableLog() {
    return {
        level: EDataSourceLevel.Success,
        status: EDataSourceStatus.Stable,
        message: 'Socket stable',
        timestamp: getNowMilliseconds(),
    };
}

function getUnstableLog() {
    return {
        level: EDataSourceLevel.Warning,
        status: EDataSourceStatus.Stable,
        message: 'Socket unstable',
        timestamp: getNowMilliseconds(),
    };
}
