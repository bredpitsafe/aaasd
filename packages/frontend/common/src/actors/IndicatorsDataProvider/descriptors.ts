import type { TSubscriptionEvent } from '@common/rx';

import type { TIndicator, TIndicatorsQuery } from '../../modules/actions/indicators/defs.ts';
import type { TSocketURL } from '../../types/domain/sockets.ts';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { EActorRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs.ts';
import type {
    TFetchIndicatorsSnapshotFilters,
    TFetchIndicatorsSnapshotProps,
    TFetchIndicatorsSnapshotSort,
} from './actions/ModuleFetchIndicatorsSnapshot.ts';

export const subscribeToIndicatorsFiniteSnapshotProcedureDescriptor =
    createRemoteProcedureDescriptor<TIndicatorsQuery, TIndicator[]>()(
        EActorRemoteProcedureName.SubscribeToIndicatorsFiniteSnapshot,
        ERemoteProcedureType.Subscribe,
    );

export const fetchIndicatorsInfinitySnapshotProcedureDescriptor = createRemoteProcedureDescriptor<
    { url: TSocketURL } & TFetchIndicatorsSnapshotProps,
    TIndicator[]
>()(EActorRemoteProcedureName.FetchIndicatorsInfinitySnapshot, ERemoteProcedureType.Request);

export const subscribeToIndicatorsInfinitySnapshotProcedureDescriptor =
    createRemoteProcedureDescriptor<
        {
            url: TSocketURL;
            sort?: TFetchIndicatorsSnapshotSort;
            filters?: TFetchIndicatorsSnapshotFilters;
        },
        TSubscriptionEvent<TIndicator[]>
    >()(
        EActorRemoteProcedureName.SubscribeToIndicatorsInfinitySnapshot,
        ERemoteProcedureType.Subscribe,
    );
