import { EActorName } from '@frontend/common/src/actors/Root/defs';
import type { TComponent } from '@frontend/common/src/types/domain/component';
import type {
    TStorageDashboardId,
    TStorageDashboardName,
    TStorageDashboardPermission,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { EStorageDashboardSharePermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import type { EDataLoadState } from '@frontend/common/src/types/loadState';
import { getActorEnvelopeBoxType } from '@frontend/common/src/utils/Actors';
import { createActorObservableBox } from '@frontend/common/src/utils/Actors/observable';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';

import type {
    TDashboardItemKey,
    TFullDashboard,
    TFullStorageDashboard,
    TStorageDashboardItemKey,
} from '../../types/fullDashboard';
import type {
    TCreateDashboardEnvelopeProps,
    TCreateServerDashboardReturnType,
} from './actions/dashboardsStorage/createDashboard';
import type { TSubscribeServerDashboardUsersReturnType } from './actions/dashboardsStorage/createDashboardUsersSubscriptionFactory';
import type { TFetchServerDashboardIdReturnType } from './actions/dashboardsStorage/fetchDashboardIdByLegacyId';
import type { TResetDashboardReturnType } from './effects/dashboardDraftResetEffect';
import type { TUpdateDashboardDraftReturnType } from './effects/dashboardDraftUpdateEffect';
import type { TSubscribeDashboardPermissionsReturnType } from './effects/dashboardPermissionsEffect';
import type { TUpdateDashboardPermissionsReturnType } from './effects/dashboardPermissionsUpdateEffect';
import type { TDeleteDashboardReturnType } from './effects/dashboardRemovalEffect';
import type { TUpdateDashboardSettingsReturnType } from './effects/dashboardShareSettingsUpdateEffect';
import type { TSubscribeDashboardListReturnType } from './effects/dashboardsListEffect';
import type { TUpdateDashboardReturnType } from './effects/dashboardUpdateEffect';
import type { TWithTraceId } from './types';

const getDashboardEnvelopeBoxType = getActorEnvelopeBoxType.bind(
    undefined,
    EActorName.FullDashboards,
);

export const getDashboardsLoadStateEnvBox = createActorObservableBox<undefined, EDataLoadState>()(
    getDashboardEnvelopeBoxType('getDashboardsLoadState'),
);

export const getDashboardsListEnvBox = createActorObservableBox<
    undefined,
    TSubscribeDashboardListReturnType
>()(getDashboardEnvelopeBoxType('getDashboardsList'));

export const getDashboardEnvBox = createActorObservableBox<
    TDashboardItemKey,
    TValueDescriptor2<TFullDashboard>
>()(getDashboardEnvelopeBoxType('getDashboard'));

export const registerExternalDashboardEnvBox = createActorObservableBox<
    Exclude<TDashboardItemKey, TStorageDashboardItemKey>,
    Exclude<TFullDashboard, TFullStorageDashboard> | undefined
>()(getDashboardEnvelopeBoxType('registerExternalDashboard'));

export const createDashboardEnvBox = createActorObservableBox<
    TWithTraceId<TCreateDashboardEnvelopeProps, 'props'>,
    TCreateServerDashboardReturnType
>()(getDashboardEnvelopeBoxType('createDashboard'));

export const updateDashboardEnvBox = createActorObservableBox<
    TWithTraceId<TFullDashboard, 'fullDashboard'>,
    TUpdateDashboardReturnType
>()(getDashboardEnvelopeBoxType('updateDashboard'));

export const updateDashboardDraftEnvBox = createActorObservableBox<
    TWithTraceId<TFullDashboard, 'fullDashboard'>,
    TUpdateDashboardDraftReturnType
>()(getDashboardEnvelopeBoxType('updateDashboardDraft'));

export const deleteDashboardEnvBox = createActorObservableBox<
    TWithTraceId<TDashboardItemKey, 'dashboardItemKey'>,
    TDeleteDashboardReturnType
>()(getDashboardEnvelopeBoxType('deleteDashboard'));

export const resetDashboardDraftEnvBox = createActorObservableBox<
    TWithTraceId<TDashboardItemKey, 'dashboardItemKey'>,
    TResetDashboardReturnType
>()(getDashboardEnvelopeBoxType('resetDashboard'));

export const updateDashboardShareSettingsEnvBox = createActorObservableBox<
    TWithTraceId<
        {
            dashboardItemKey: TDashboardItemKey;
            sharePermission: EStorageDashboardSharePermission;
        },
        'props'
    >,
    TUpdateDashboardSettingsReturnType
>()(getDashboardEnvelopeBoxType('updateDashboardShareSettings'));

export const dashboardUpdateProgressSetEnvBox = createActorObservableBox<
    undefined,
    TStorageDashboardId[]
>()(getDashboardEnvelopeBoxType('dashboardUpdateProgressSet'));

export const fetchDashboardIdByLegacyIdEnvBox = createActorObservableBox<
    TComponent['id'],
    TFetchServerDashboardIdReturnType
>()(getDashboardEnvelopeBoxType('fetchDashboardIdByLegacyId'));

export const subscribeDashboardPermissionsEnvBox = createActorObservableBox<
    TWithTraceId<TDashboardItemKey, 'dashboardItemKey'>,
    TSubscribeDashboardPermissionsReturnType
>()(getDashboardEnvelopeBoxType('subscribeDashboardPermissions'));

export const updateDashboardPermissionsEnvBox = createActorObservableBox<
    TWithTraceId<
        {
            dashboardItemKey: TDashboardItemKey;
            permissions: TStorageDashboardPermission[];
        },
        'props'
    >,
    TUpdateDashboardPermissionsReturnType
>()(getDashboardEnvelopeBoxType('updateDashboardPermissions'));

export const subscribeDashboardUsersEnvBox = createActorObservableBox<
    TraceId,
    TSubscribeServerDashboardUsersReturnType
>()(getDashboardEnvelopeBoxType('subscribeDashboardUsers'));

export const renameDashboardEnvBox = createActorObservableBox<
    TWithTraceId<
        {
            dashboardItemKey: TDashboardItemKey;
            name: TStorageDashboardName;
        },
        'props'
    >,
    TValueDescriptor2<true>
>()(getDashboardEnvelopeBoxType('renameDashboard'));

export const FullDashboardsEnvelopTypes = new Set(
    [
        getDashboardsLoadStateEnvBox,
        getDashboardsListEnvBox,
        getDashboardEnvBox,
        registerExternalDashboardEnvBox,
        createDashboardEnvBox,
        updateDashboardEnvBox,
        updateDashboardDraftEnvBox,
        deleteDashboardEnvBox,
        resetDashboardDraftEnvBox,
        updateDashboardShareSettingsEnvBox,
        dashboardUpdateProgressSetEnvBox,
        fetchDashboardIdByLegacyIdEnvBox,
        subscribeDashboardPermissionsEnvBox,
        updateDashboardPermissionsEnvBox,
        subscribeDashboardUsersEnvBox,
        renameDashboardEnvBox,
    ].map(({ requestType }) => requestType),
);
