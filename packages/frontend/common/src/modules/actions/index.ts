import { ModuleFactory, TContextRef } from '../../di';
import { ModuleActor } from '../actor';
import { ModuleNotifications } from '../notifications/module';
import { createConfig } from './config/createConfig';
import { getConfigRevision } from './config/getConfigRevision';
import { getConfigRevisions } from './config/getConfigRevisions';
import { getSocketAssetsDedobsed$ } from './dictionaries/getSocketAssets$';
import { getSocketInstrumentsDedobsed$ } from './dictionaries/getSocketInstruments$';
import { getAvailableAccounts } from './getAvailableAccounts';
import { getComponentStateDedobs } from './getComponentState';
import { getComponentStateRevisionsDedobs } from './getComponentStateRevisions';
import { getSnapshotRobotDashboardList } from './getSnapshotRobotDashboardList';
import { fetchProductLogsUnbound } from './productLogs/fetchProductLogs';
import { subscribeToProductLogUpdatesUnbound } from './productLogs/subscribeToProductLogs';
import { runCustomCommand, runCustomCommandRemote } from './runCustomCommand';
import { setComponentUpdating } from './setComponentUpdating';
import { showError } from './showError';
import { subscribeComponentConfigUpdates$ } from './subscribeComponentConfigUpdates$';
import { subscribeComponentUpdates } from './subscribeComponentUpdates';
import { subscribeCurrentRobotDashboardListUpdates } from './subscribeRobotDashboardListUpdates';
import { updateComponentConfig } from './updateComponentConfig';
import {
    restartComponent,
    sendGenericComponentCommandAction,
    startComponent,
    stopComponent,
    unblockRobot,
} from './сomponentCommands';

export const getModuleBaseActions = (ctx: TContextRef) => {
    const actor = ModuleActor(ctx);
    const notifications = ModuleNotifications(ctx);

    return {
        showError: showError.bind(null, ctx),
        setComponentUpdating: setComponentUpdating.bind(null, ctx),
        subscribeComponentUpdates: subscribeComponentUpdates.bind(null, ctx),
        subscribeRobotDashboardListUpdates: subscribeCurrentRobotDashboardListUpdates.bind(
            null,
            ctx,
        ),

        fetchProductLogs: fetchProductLogsUnbound.bind(null, {
            actor,
            notifications,
        }),
        subscribeToProductLogUpdates: subscribeToProductLogUpdatesUnbound.bind(null, {
            actor,
            notifications,
        }),

        getRobotDashboardSnapshotList: getSnapshotRobotDashboardList.bind(null, ctx),
        sendGenericComponentCommandAction: sendGenericComponentCommandAction.bind(null, ctx),
        startComponent: startComponent.bind(null, ctx),
        stopComponent: stopComponent.bind(null, ctx),
        restartComponent: restartComponent.bind(null, ctx),
        unblockRobot: unblockRobot.bind(null, ctx),
        //Config
        updateComponentConfig: updateComponentConfig.bind(null, ctx),
        createConfig: createConfig.bind(null, ctx),
        getConfigRevisions: getConfigRevisions.bind(null, ctx),
        getConfigRevision: getConfigRevision.bind(null, ctx),
        subscribeComponentConfigUpdates$: subscribeComponentConfigUpdates$.bind(null, ctx),
        // Component state
        getComponentStateRevisions: getComponentStateRevisionsDedobs.bind(null, ctx),
        getComponentState: getComponentStateDedobs.bind(null, ctx),
        getAvailableAccounts: getAvailableAccounts.bind(null, ctx),
        runCustomCommand: runCustomCommand.bind(null, ctx),
        runCustomCommandRemote: runCustomCommandRemote.bind(null, ctx),
        // Dictionaries
        getSocketAssetsDedobsed$: getSocketAssetsDedobsed$.bind(null, ctx),
        getSocketInstrumentsDedobsed$: getSocketInstrumentsDedobsed$.bind(null, ctx),
    };
};

export type IModuleBaseActions = ReturnType<typeof getModuleBaseActions>;

export const ModuleBaseActions = ModuleFactory(getModuleBaseActions);
