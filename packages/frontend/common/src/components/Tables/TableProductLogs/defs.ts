import type { TProductLogSubscriptionFilters } from '../../../modules/actions/productLogs/defs.ts';
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
