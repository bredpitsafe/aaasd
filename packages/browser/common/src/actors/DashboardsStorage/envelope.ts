import type {
    TSubscribeToDashboardsListArguments,
    TSubscribeToDashboardsListReturnType,
} from '../../modules/observables/createDashboardsListSubscriptionFactory';
import type {
    TSubscribeToDashboardArguments,
    TSubscribeToDashboardReturnType,
} from '../../modules/observables/createDashboardSubscriptionFactory';
import { getActorEnvelopeBoxType } from '../../utils/Actors';
import { createActorObservableBox } from '../../utils/Actors/observable';
import { createActorRequestBox } from '../../utils/Actors/request';
import { EActorName } from '../Root/defs';
import type {
    TCreateDashboardArguments,
    TCreateDashboardReturnType,
} from './actions/createDashboard';
import type {
    TDeleteDashboardArguments,
    TDeleteDashboardReturnType,
} from './actions/deleteDashboard';
import type {
    TFetchDashboardConfigArguments,
    TFetchDashboardConfigReturnType,
} from './actions/fetchDashboardConfig';
import type {
    TFetchDashboardDraftArguments,
    TFetchDashboardDraftReturnType,
} from './actions/fetchDashboardDraft';
import type {
    TFetchDashboardIdByLegacyIdArguments,
    TFetchDashboardIdByLegacyIdReturnType,
} from './actions/fetchDashboardIdByLegacyId';
import type {
    TRenameDashboardArguments,
    TRenameDashboardReturnType,
} from './actions/renameDashboard';
import type {
    TResetDashboardDraftArguments,
    TResetDashboardDraftReturnType,
} from './actions/resetDashboardDraft';
import type {
    TSubscribeDashboardPermissionsArguments,
    TSubscribeDashboardPermissionsReturnType,
} from './actions/subscribeDashboardPermissions';
import type {
    TSubscribeDashboardUsersArguments,
    TSubscribeDashboardUsersReturnType,
} from './actions/subscribeDashboardUsers';
import type {
    TUpdateDashboardArguments,
    TUpdateDashboardReturnType,
} from './actions/updateDashboard';
import type {
    TUpdateDashboardDraftArguments,
    TUpdateDashboardDraftReturnType,
} from './actions/updateDashboardDraft';
import type {
    TUpdateDashboardPermissionsArguments,
    TUpdateDashboardPermissionsReturnType,
} from './actions/updateDashboardPermissions';
import type {
    TUpdateDashboardShareSettingsArguments,
    TUpdateDashboardShareSettingsReturnType,
} from './actions/updateDashboardShareSettings';

const getStorageDashboardEnvelopeBoxType = getActorEnvelopeBoxType.bind(
    undefined,
    EActorName.DashboardsStorage,
);

export const subscribeToDashboardEnvBox = createActorObservableBox<
    TSubscribeToDashboardArguments,
    TSubscribeToDashboardReturnType
>()(getStorageDashboardEnvelopeBoxType('subscribeToDashboard'));

export const subscribeToDashboardsListEnvBox = createActorObservableBox<
    TSubscribeToDashboardsListArguments,
    TSubscribeToDashboardsListReturnType
>()(getStorageDashboardEnvelopeBoxType('subscribeToDashboardsList'));

export const createDashboardEnvBox = createActorRequestBox<
    TCreateDashboardArguments,
    TCreateDashboardReturnType
>()(getStorageDashboardEnvelopeBoxType('createDashboard'));

export const deleteDashboardEnvBox = createActorRequestBox<
    TDeleteDashboardArguments,
    TDeleteDashboardReturnType
>()(getStorageDashboardEnvelopeBoxType('deleteDashboard'));

export const resetDashboardDraftEnvBox = createActorRequestBox<
    TResetDashboardDraftArguments,
    TResetDashboardDraftReturnType
>()(getStorageDashboardEnvelopeBoxType('resetDashboardDraft'));

export const updateDashboardDraftEnvBox = createActorRequestBox<
    TUpdateDashboardDraftArguments,
    TUpdateDashboardDraftReturnType
>()(getStorageDashboardEnvelopeBoxType('updateDashboardDraft'));

export const updateDashboardEnvBox = createActorRequestBox<
    TUpdateDashboardArguments,
    TUpdateDashboardReturnType
>()(getStorageDashboardEnvelopeBoxType('updateDashboard'));

export const updateDashboardPermissionsEnvBox = createActorRequestBox<
    TUpdateDashboardPermissionsArguments,
    TUpdateDashboardPermissionsReturnType
>()(getStorageDashboardEnvelopeBoxType('updateDashboardPermissions'));

export const updateDashboardShareSettingsEnvBox = createActorRequestBox<
    TUpdateDashboardShareSettingsArguments,
    TUpdateDashboardShareSettingsReturnType
>()(getStorageDashboardEnvelopeBoxType('updateDashboardShareSettings'));

export const fetchDashboardConfigEnvBox = createActorRequestBox<
    TFetchDashboardConfigArguments,
    TFetchDashboardConfigReturnType
>()(getStorageDashboardEnvelopeBoxType('fetchDashboardConfig'));

export const fetchDashboardDraftEnvBox = createActorRequestBox<
    TFetchDashboardDraftArguments,
    TFetchDashboardDraftReturnType
>()(getStorageDashboardEnvelopeBoxType('fetchDashboardDraft'));

export const fetchDashboardIdByLegacyIdEnvBox = createActorRequestBox<
    TFetchDashboardIdByLegacyIdArguments,
    TFetchDashboardIdByLegacyIdReturnType
>()(getStorageDashboardEnvelopeBoxType('fetchDashboardIdByLegacyId'));

export const subscribeDashboardPermissionsEnvBox = createActorObservableBox<
    TSubscribeDashboardPermissionsArguments,
    TSubscribeDashboardPermissionsReturnType
>()(getStorageDashboardEnvelopeBoxType('subscribeDashboardPermissions'));

export const subscribeDashboardUsersEnvBox = createActorObservableBox<
    TSubscribeDashboardUsersArguments,
    TSubscribeDashboardUsersReturnType
>()(getStorageDashboardEnvelopeBoxType('subscribeDashboardUsers'));

export const renameDashboardEnvBox = createActorRequestBox<
    TRenameDashboardArguments,
    TRenameDashboardReturnType
>()(getStorageDashboardEnvelopeBoxType('renameDashboard'));
