import type { TSubscriptionEvent } from '@common/rx';

import type { TProductLog } from '../../modules/actions/productLogs/defs.ts';
import type { TBacktestingTask } from '../../types/domain/backtestings';
import type { TOwnTrade } from '../../types/domain/ownTrades';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { EActorRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs.ts';
import type { TFetchBacktestingTasksSnapshotProps } from '../BacktestingDataProviders/actions/ModuleFetchBacktestingTasksSnapshot';
import type { TBacktestingTasksInfinitySnapshotBankProps } from './src/backtestingTasksInfinitySnapshotBank.ts';
import type { TFetchOwnTradesParams, TFetchOwnTradesProps } from './src/ModuleFetchOwnTrades.ts';
import type { TFetchProductLogsProps } from './src/ModuleFetchProductLogs.ts';
import type {
    TSubscribeToOwnTradesParams,
    TSubscribeToOwnTradesProps,
} from './src/ModuleSubscribeToOwnTrades.ts';
import type { TSubscribeToProductLogsProps } from './src/ModuleSubscribeToProductLogs.ts';

export const requestProductLogItemsProcedureDescriptor = createRemoteProcedureDescriptor<
    TFetchProductLogsProps,
    TProductLog[]
>()(EActorRemoteProcedureName.RequestProductLogItems, ERemoteProcedureType.Request);

export const subscribeToProductLogUpdatesProcedureDescriptor = createRemoteProcedureDescriptor<
    Pick<TSubscribeToProductLogsProps, 'target' | 'filters'>,
    TSubscriptionEvent<TProductLog[]>
>()(EActorRemoteProcedureName.SubscribeToProductLogUpdates, ERemoteProcedureType.Subscribe);

export const requestOwnTradeItemsProcedureDescriptor = createRemoteProcedureDescriptor<
    Pick<TFetchOwnTradesProps, 'target' | 'filters'> & {
        params: TFetchOwnTradesParams & Pick<TSubscribeToOwnTradesParams, 'timeZone'>;
    },
    TOwnTrade[]
>()(EActorRemoteProcedureName.RequestOwnTradeItems, ERemoteProcedureType.Request);

export const subscribeToOwnTradeUpdatesProcedureDescriptor = createRemoteProcedureDescriptor<
    Pick<TSubscribeToOwnTradesProps, 'target' | 'filters'> & {
        params: Pick<TSubscribeToOwnTradesParams, 'timeZone'>;
    },
    TSubscriptionEvent<TOwnTrade[]>
>()(EActorRemoteProcedureName.SubscribeToOwnTradeUpdates, ERemoteProcedureType.Subscribe);

export const requestBacktestingTaskItemsProcedureDescriptor = createRemoteProcedureDescriptor<
    TFetchBacktestingTasksSnapshotProps,
    TBacktestingTask[]
>()(EActorRemoteProcedureName.RequestBacktestingTaskItems, ERemoteProcedureType.Request);

export const subscribeToBacktestingTaskUpdatesProcedureDescriptor = createRemoteProcedureDescriptor<
    TBacktestingTasksInfinitySnapshotBankProps,
    TSubscriptionEvent<TBacktestingTask[]>
>()(EActorRemoteProcedureName.SubscribeToBacktestingTaskUpdates, ERemoteProcedureType.Subscribe);
