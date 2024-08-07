import type { TSubscriptionEvent } from '@common/rx';

import type {
    TFetchSnapshotParams,
    TWithPollInterval,
    TWithUpdatesOnly,
} from '../../modules/actions/def.ts';
import type { TComponentId } from '../../types/domain/component.ts';
import type { TComponentStateRevision } from '../../types/domain/ComponentStateRevision.ts';
import type { TActiveOrder } from '../../types/domain/orders';
import type { TSocketURL, TWithSocketTarget } from '../../types/domain/sockets';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { EActorRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs.ts';
import type {
    TGetComponentStateRevisionProps,
    TGetComponentStateRevisionReturnType,
} from './modules/actions/ModuleFetchComponentStateRevision.ts';
import type {
    TOrdersSnapshotFilters,
    TOrdersSnapshotSortOrder,
} from './modules/actions/ModuleFetchOrdersSnapshot.ts';

export const FetchComponentStateRevisionProcedureDescriptor = createRemoteProcedureDescriptor<
    TGetComponentStateRevisionProps,
    TGetComponentStateRevisionReturnType
>()(EActorRemoteProcedureName.FetchComponentStateRevision, ERemoteProcedureType.Request);

export const SubscribeToComponentStateRevisionsSnapshotProcedureDescriptor =
    createRemoteProcedureDescriptor<
        TWithSocketTarget & {
            componentId: TComponentId;
            btRunNo?: number;
        },
        TComponentStateRevision[]
    >()(EActorRemoteProcedureName.SubscribeToComponentStateRevisions, ERemoteProcedureType.Request);

export const fetchComponentStateProcedureDescriptor = createRemoteProcedureDescriptor<
    {
        target: TSocketURL;
        digest: string;
        componentId: TComponentId;
    },
    string
>()(EActorRemoteProcedureName.FetchComponentState, ERemoteProcedureType.Request);

export const fetchGateKindsProcedureDescriptor = createRemoteProcedureDescriptor<
    TWithSocketTarget,
    {
        execGates: string[];
        mdGates: string[];
    }
>()(EActorRemoteProcedureName.FetchGateKinds, ERemoteProcedureType.Request);

export const fetchOrdersSnapshotProcedureDescriptor = createRemoteProcedureDescriptor<
    TWithSocketTarget & {
        params: TFetchSnapshotParams;
        sort?: TOrdersSnapshotSortOrder;
        filters?: TOrdersSnapshotFilters;
    },
    TActiveOrder[]
>()(EActorRemoteProcedureName.RequestOrdersItems, ERemoteProcedureType.Request);

export const subscribeToOrdersUpdatesProcedureDescriptor = createRemoteProcedureDescriptor<
    TWithSocketTarget &
        TWithUpdatesOnly &
        TWithPollInterval & {
            params: TFetchSnapshotParams;
            sort?: TOrdersSnapshotSortOrder;
            filters?: Omit<TOrdersSnapshotFilters, 'statuses'>;
        },
    TSubscriptionEvent<TActiveOrder[]>
>()(EActorRemoteProcedureName.SubscribeToOrdersUpdates, ERemoteProcedureType.Subscribe);
