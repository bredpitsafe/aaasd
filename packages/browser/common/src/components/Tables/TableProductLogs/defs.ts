import { TProductLogSubscriptionFilters } from '../../../handlers/productLogs/defs';
import type { TSocketURL } from '../../../types/domain/sockets';

export type TProductLogsStorageKeys = {
    hook: string;
    view: string;
};

export type TProductLogsProps = {
    storageKeys: TProductLogsStorageKeys;
    socketUrl: TSocketURL | undefined;
    backtestingRunId?: TProductLogSubscriptionFilters['backtestingRunId'];
};
