import { ModuleFactory, TContextRef } from '@frontend/common/src/di';
import { ModuleGetRobotDashboard } from '@frontend/common/src/modules/actions/getRobotDashboard';
import { mergeMapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { EMPTY, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { addPanel } from './dashboards/addPanel';
import { clonePanel } from './dashboards/clonePanel';
import { createDashboard } from './dashboards/createDashboard';
import { createDashboardLayout } from './dashboards/createDashboardLayout';
import { currentDashboardSubscription } from './dashboards/currentDashboardSubscription';
import { deleteDashboard } from './dashboards/deleteDashboard';
import { deleteDashboardLayout } from './dashboards/deleteDashboardLayout';
import { deletePanel } from './dashboards/deletePanel';
import { exportFullDashboard } from './dashboards/exportFullDashboard';
import { renameDashboard } from './dashboards/renameDashboard';
import { resetDashboardDraft } from './dashboards/resetDashboardDraft';
import { switchDashboardLayout } from './dashboards/switchDashboardLayout';
import { updateDashboard } from './dashboards/updateDashboard';
import { updateDashboardPermissions } from './dashboards/updateDashboardPermissions';
import { updateDashboardShareSettings } from './dashboards/updateDashboardShareSettings';
import { updateGridLayout } from './dashboards/updateGridLayout';
import { updatePanel } from './dashboards/updatePanel';
import { updatePanelsLayouts } from './dashboards/updatePanelsLayouts';
import { cloneDashboard } from './modals/cloneDashboard';
import { clonePanelWithDashboardSelector } from './modals/clonePanelWithDashboardSelector';
import { importDashboard } from './modals/importDashboard';
import { openModalChangePermissions } from './modals/openModalChangePermissions';
import { openModalFullDashboardEditor } from './modals/openModalFullDashboardConfig';
import { saveDashboard } from './modals/saveDashboard';
import {
    getRouteParamsForURLByDashboardItemKey,
    getURLByDashboardItemKey,
    navigateByDashboardItemKey,
} from './navigation/navigateByDashboardItemKey';

function createModule(ctx: TContextRef) {
    const currentDashboard$ = currentDashboardSubscription(ctx);

    const plainCurrentDashboard$ = currentDashboard$.pipe(
        mergeMapValueDescriptor({
            unsynced: () => EMPTY,
            synced: ({ value }) => of(value),
        }),
        shareReplay(1),
    );

    return {
        currentDashboard$,

        createDashboard: createDashboard.bind(null, ctx),
        saveDashboard: saveDashboard.bind(null, ctx),
        updateDashboard: updateDashboard.bind(null, ctx, new Set<string>()),
        deleteDashboard: deleteDashboard.bind(null, ctx),
        resetDashboardDraft: resetDashboardDraft.bind(null, ctx),
        switchDashboardLayout: switchDashboardLayout.bind(null, ctx, plainCurrentDashboard$),
        createDashboardLayout: createDashboardLayout.bind(null, ctx, plainCurrentDashboard$),
        deleteDashboardLayout: deleteDashboardLayout.bind(null, ctx, plainCurrentDashboard$),
        updateGridLayout: updateGridLayout.bind(null, ctx, plainCurrentDashboard$),
        updateDashboardShareSettings: updateDashboardShareSettings.bind(null, ctx),
        updateDashboardPermissions: updateDashboardPermissions.bind(null, ctx),

        addPanel: addPanel.bind(null, ctx, plainCurrentDashboard$),
        updatePanel: updatePanel.bind(null, ctx, plainCurrentDashboard$),
        updatePanelsLayouts: updatePanelsLayouts.bind(null, ctx, plainCurrentDashboard$),
        deletePanel: deletePanel.bind(null, ctx, plainCurrentDashboard$),
        clonePanel: clonePanel.bind(null, ctx, plainCurrentDashboard$),
        renameDashboard: renameDashboard.bind(null, ctx),

        openModalFullDashboardEditor: openModalFullDashboardEditor.bind(null, ctx),
        clonePanelWithDashboardSelector: clonePanelWithDashboardSelector.bind(
            null,
            ctx,
            plainCurrentDashboard$,
        ),
        openModalChangePermissions: openModalChangePermissions.bind(null, ctx),

        cloneDashboard: cloneDashboard.bind(null, ctx),
        importDashboard: importDashboard.bind(null, ctx),
        exportFullDashboard: exportFullDashboard.bind(null, ctx, plainCurrentDashboard$),

        getURLByDashboardItemKey: getURLByDashboardItemKey.bind(null, ctx),
        navigateByDashboardItemKey: navigateByDashboardItemKey.bind(null, ctx),
        getRouteParamsForURLByDashboardItemKey: getRouteParamsForURLByDashboardItemKey.bind(
            null,
            ctx,
        ),

        getRobotDashboard: ModuleGetRobotDashboard(ctx),
    };
}

export const ModuleDashboardActions = ModuleFactory(createModule);
