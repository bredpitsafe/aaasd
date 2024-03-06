import { lazifyActor } from '../../utils/Actors';
import {
    createDashboardEnvBox,
    deleteDashboardEnvBox,
    fetchDashboardConfigEnvBox,
    fetchDashboardDraftEnvBox,
    fetchDashboardIdByLegacyIdEnvBox,
    renameDashboardEnvBox,
    resetDashboardDraftEnvBox,
    subscribeDashboardPermissionsEnvBox,
    subscribeDashboardUsersEnvBox,
    subscribeToDashboardEnvBox,
    subscribeToDashboardsListEnvBox,
    updateDashboardDraftEnvBox,
    updateDashboardEnvBox,
    updateDashboardPermissionsEnvBox,
    updateDashboardShareSettingsEnvBox,
} from './envelope';

export const createLazyActorDashboardsStorage = () =>
    lazifyActor(
        (envelope) => {
            switch (envelope.type) {
                case subscribeToDashboardEnvBox.requestType:
                case subscribeToDashboardsListEnvBox.requestType:
                case createDashboardEnvBox.requestType:
                case deleteDashboardEnvBox.requestType:
                case resetDashboardDraftEnvBox.requestType:
                case updateDashboardDraftEnvBox.requestType:
                case updateDashboardEnvBox.requestType:
                case updateDashboardPermissionsEnvBox.requestType:
                case updateDashboardShareSettingsEnvBox.requestType:
                case fetchDashboardConfigEnvBox.requestType:
                case fetchDashboardDraftEnvBox.requestType:
                case fetchDashboardIdByLegacyIdEnvBox.requestType:
                case subscribeDashboardPermissionsEnvBox.requestType:
                case subscribeDashboardUsersEnvBox.requestType:
                case renameDashboardEnvBox.requestType:
                    return true;
                default:
                    return false;
            }
        },
        () => import('./index').then((m) => m.createActorDashboardsStorage()),
    );
