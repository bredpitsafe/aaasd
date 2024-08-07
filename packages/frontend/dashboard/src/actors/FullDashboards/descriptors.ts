import type {
    TStorageDashboardId,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import type { EDataLoadState } from '@frontend/common/src/types/loadState';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor';
import {
    EActorRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';

import type { TDashboardItem, TDashboardItemKey, TFullDashboard } from '../../types/fullDashboard';
import type { TSubscribeToDashboardsListParams } from './actions/dashboardsStorage/createDashboardsListSubscriptionFactory';
import type { TUpdateBindingSendBody } from './actions/dashboardsStorage/updateDashboardScopeBinding';

export const getDashboardsLoadStateProcedureDescriptor = createRemoteProcedureDescriptor<
    undefined,
    EDataLoadState
>()(EActorRemoteProcedureName.GetDashboardsLoadState, ERemoteProcedureType.Request);

export const getDashboardsListProcedureDescriptor = createRemoteProcedureDescriptor<
    TSubscribeToDashboardsListParams | undefined,
    TDashboardItem[]
>()(EActorRemoteProcedureName.GetDashboardsList, ERemoteProcedureType.Request);

export const SubscribeToDashboardProcedureDescriptor = createRemoteProcedureDescriptor<
    TDashboardItemKey,
    TFullDashboard
>()(EActorRemoteProcedureName.GetDashboard, ERemoteProcedureType.Subscribe);

export const updateDashboardProcedureDescriptor = createRemoteProcedureDescriptor<
    TFullDashboard,
    TDashboardItemKey
>()(EActorRemoteProcedureName.UpdateDashboard, ERemoteProcedureType.Update);

export const updateDashboardDraftProcedureDescriptor = createRemoteProcedureDescriptor<
    TFullDashboard,
    true
>()(EActorRemoteProcedureName.UpdateDashboardDraft, ERemoteProcedureType.Update);

export const updateDashboardScopeBindingProcedureDescriptor = createRemoteProcedureDescriptor<
    TUpdateBindingSendBody,
    true
>()(EActorRemoteProcedureName.UpdateDashboardScopeBinding, ERemoteProcedureType.Update);

export const deleteDashboardProcedureDescriptor = createRemoteProcedureDescriptor<
    TDashboardItemKey,
    true
>()(EActorRemoteProcedureName.DeleteDashboard, ERemoteProcedureType.Update);

export const resetDashboardDraftProcedureDescriptor = createRemoteProcedureDescriptor<
    TDashboardItemKey,
    true
>()(EActorRemoteProcedureName.ResetDashboard, ERemoteProcedureType.Update);

export const renameDashboardProcedureDescriptor = createRemoteProcedureDescriptor<
    {
        dashboardItemKey: TDashboardItemKey;
        name: TStorageDashboardName;
    },
    true
>()(EActorRemoteProcedureName.RenameDashboard, ERemoteProcedureType.Update);

export const SubscribeToDashboardUpdateProgressProcedureDescriptor =
    createRemoteProcedureDescriptor<undefined, TStorageDashboardId[]>()(
        EActorRemoteProcedureName.DashboardUpdateProgressSet,
        ERemoteProcedureType.Subscribe,
    );
