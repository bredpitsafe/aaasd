import type { TContextRef } from '../../di';
import { createDashboardsListSubscriptionFactory } from '../../modules/observables/createDashboardsListSubscriptionFactory';
import { createDashboardSubscriptionFactory } from '../../modules/observables/createDashboardSubscriptionFactory';
import { createActor } from '../../utils/Actors';
import { EActorName } from '../Root/defs';
import { createDashboard } from './actions/createDashboard';
import { deleteDashboard } from './actions/deleteDashboard';
import { fetchDashboardConfig } from './actions/fetchDashboardConfig';
import { fetchDashboardDraft } from './actions/fetchDashboardDraft';
import { fetchDashboardIdByLegacyId } from './actions/fetchDashboardIdByLegacyId';
import { renameDashboard } from './actions/renameDashboard';
import { resetDashboardDraft } from './actions/resetDashboardDraft';
import { subscribeDashboardPermissions } from './actions/subscribeDashboardPermissions';
import { subscribeDashboardUsers } from './actions/subscribeDashboardUsers';
import { updateDashboard } from './actions/updateDashboard';
import { updateDashboardDraft } from './actions/updateDashboardDraft';
import { updateDashboardPermissions } from './actions/updateDashboardPermissions';
import { updateDashboardShareSettings } from './actions/updateDashboardShareSettings';
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

export function createActorDashboardsStorage() {
    return createActor(EActorName.DashboardsStorage, (context) => {
        const ctx = context as unknown as TContextRef;

        const subscribeToDashboardsListDedobsed$ = createDashboardsListSubscriptionFactory(ctx);
        const subscribeToDashboardDedobsed$ = createDashboardSubscriptionFactory(ctx);

        subscribeToDashboardEnvBox.responseStream(context, (props) =>
            subscribeToDashboardDedobsed$(props),
        );

        subscribeToDashboardsListEnvBox.responseStream(context, (props) =>
            subscribeToDashboardsListDedobsed$(props),
        );

        createDashboardEnvBox.response(context, (props) => createDashboard(ctx, props));

        deleteDashboardEnvBox.response(context, (props) => deleteDashboard(ctx, props));

        resetDashboardDraftEnvBox.response(context, (props) => resetDashboardDraft(ctx, props));

        updateDashboardDraftEnvBox.response(context, (props) => updateDashboardDraft(ctx, props));

        updateDashboardEnvBox.response(context, (props) => updateDashboard(ctx, props));

        updateDashboardPermissionsEnvBox.response(context, (props) =>
            updateDashboardPermissions(ctx, props),
        );

        updateDashboardShareSettingsEnvBox.response(context, (props) =>
            updateDashboardShareSettings(ctx, props),
        );

        fetchDashboardConfigEnvBox.response(context, (props) => fetchDashboardConfig(ctx, props));

        fetchDashboardDraftEnvBox.response(context, (props) => fetchDashboardDraft(ctx, props));

        fetchDashboardIdByLegacyIdEnvBox.response(context, (props) =>
            fetchDashboardIdByLegacyId(ctx, props),
        );

        subscribeDashboardPermissionsEnvBox.responseStream(context, (props) =>
            subscribeDashboardPermissions(ctx, props),
        );

        subscribeDashboardUsersEnvBox.responseStream(context, (props) =>
            subscribeDashboardUsers(ctx, props),
        );

        renameDashboardEnvBox.response(context, (props) => renameDashboard(ctx, props));
    });
}
