import { TSocketName } from '../../types/domain/sockets';
import { uniqualizeProcedureNames } from './utils.ts';

export enum ERemoteProcedureType {
    Update = 'Update',
    Request = 'Request',
    Subscribe = 'Subscribe',
}

export enum EPlatformSocketRemoteProcedureName {
    // Indicators
    FetchIndicatorsSnapshot = 'FetchIndicatorsSnapshot',
    SubscribeToIndicators = 'SubscribeToIndicators',
    // Components
    GetComponentConfig = 'GetComponentConfig',
    SubscribeComponentUpdates = 'SubscribeComponentUpdates',

    // Robots
    SubscribeToRobotDashboardList = 'SubscribeToRobotDashboardList',

    // Backtesting
    ValidateBacktestTask = 'ValidateBacktestTask',
    UpdateBacktestTask = 'UpdateBacktestTask',
    StopBacktestTask = 'StopBacktestTask',
    StartBacktestTask = 'StartBacktestTask',
    ContinueBacktest = 'ContinueBacktest',
    RemoveBacktestTask = 'RemoveBacktestTask',
    CreateAndStartBacktestTask = 'CreateAndStartBacktestTask',
    FetchBacktestTaskConfigs = 'FetchBacktestTaskConfigs',
    FetchBacktestTasksSnapshot = 'FetchBacktestTasksSnapshot',
    SubscribeToBacktestTasks = 'SubscribeToBacktestTasks',
    SubscribeToBacktestRuns = 'SubscribeToBacktestRuns',

    // Fetcher
    FetchChunks = 'FetchChunks',
    // Timeseries
    FetchTaggedTimeseriesData = 'FetchTaggedTimeseriesData',

    // Books
    FetchL2BookSnapshot = 'FetchL2BookSnapshot',
    FetchL2BookUpdates = 'FetchL2BookUpdates',

    // Robot
    GetRobotDashboard = 'GetRobotDashboard',
    ListRobotDashboards = 'ListRobotDashboards',

    // DashboardsStorage
    CreateDashboard = 'CreateDashboard',
    UpdateDashboard = 'UpdateDashboard',
    RenameDashboard = 'RenameDashboard',
    DeleteDashboard = 'DeleteDashboard',
    ResetDashboardDraft = 'ResetDashboardDraft',
    FetchDashboardDraft = 'FetchDashboardDraft',
    UpdateDashboardDraft = 'UpdateDashboardDraft',
    FetchDashboardConfig = 'FetchDashboardConfig',
    FetchDashboardIdByLegacyId = 'FetchDashboardIdByLegacyId',
    SubscribeToUsers = 'SubscribeToUsers',
    SubscribeToDashboard = 'SubscribeToDashboard',
    SubscribeToDashboardsList = 'SubscribeToDashboardsList',
    UpdateDashboardShareSettings = 'UpdateDashboardShareSettings',
    UpdateDashboardPermissions = 'UpdateDashboardPermissions',
    SubscribeToDashboardPermissions = 'SubscribeToDashboardPermissions',

    // Trading Data Provider
    FetchConvertRatesSnapshot = 'FetchConvertRatesSnapshot',
    SubscribeToConvertRates = 'SubscribeToConvertRates',
    FetchStmPositionsSnapshot = 'FetchStmPositionsSnapshot',
    SubscribeToStmPositions = 'SubscribeToStmPositions',
    FetchStmBalancesSnapshot = 'FetchStmBalancesSnapshot',
    SubscribeToStmBalances = 'SubscribeToStmBalances',
}
uniqualizeProcedureNames('PlatformSocket', EPlatformSocketRemoteProcedureName);

export enum EBffSocketRemoteProcedureName {
    FetchTaggedTimeseriesData = 'FetchTaggedTimeseriesData',
    FetchTimeseriesVisualConfigs = 'FetchTimeseriesVisualConfigs',
}
uniqualizeProcedureNames('BFFmSocket', EBffSocketRemoteProcedureName);

export enum EActorRemoteProcedureName {
    GetBacktestingTaskConfigs = 'GetBacktestingTaskConfigs',
    SubscribeToBacktestingTask = 'SubscribeToBacktestingTask',
    SubscribeToBacktestingRun = 'SubscribeToBacktestingRun',

    // Chart
    GetChartPoints = 'GetChartPoints',
    GetChartTaggedMetadata = 'GetChartTaggedMetadata',

    // FullDashboards
    GetDashboardsLoadState = 'GetDashboardsLoadState',
    GetDashboardsList = 'GetDashboardsList',
    GetDashboard = 'GetDashboard',
    RegisterExternalDashboard = 'RegisterExternalDashboard',
    CreateDashboard = 'CreateDashboard',
    UpdateDashboard = 'UpdateDashboard',
    UpdateDashboardDraft = 'UpdateDashboardDraft',
    DeleteDashboard = 'DeleteDashboard',
    ResetDashboard = 'ResetDashboard',
    UpdateDashboardShareSettings = 'UpdateDashboardShareSettings',
    DashboardUpdateProgressSet = 'DashboardUpdateProgressSet',
    FetchDashboardIdByLegacyId = 'FetchDashboardIdByLegacyId',
    SubscribeDashboardPermissions = 'SubscribeDashboardPermissions',
    UpdateDashboardPermissions = 'UpdateDashboardPermissions',
    SubscribeDashboardUsers = 'SubscribeDashboardUsers',
    RenameDashboard = 'RenameDashboard',

    // Indicators
    FetchIndicatorsInfinitySnapshot = 'FetchIndicatorsInfinitySnapshot',
    SubscribeToIndicatorsInfinitySnapshot = 'SubscribeToIndicatorsInfinitySnapshot',
    SubscribeToIndicatorsFiniteSnapshot = 'SubscribeToIndicatorsFiniteSnapshot',
}
uniqualizeProcedureNames('Actor', EActorRemoteProcedureName);

export type TWithRequiredStageField<T extends EBffSocketRemoteProcedureName> =
    T extends EBffSocketRemoteProcedureName.FetchTaggedTimeseriesData
        ? { requestStage: TSocketName }
        : {};
