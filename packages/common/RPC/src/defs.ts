import type { TStructurallyCloneable } from '@common/types';

import { uniqualizeProcedureNames } from './utils.ts';

export type TRemoteProcedureDescriptor<
    Name extends string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Send extends TStructurallyCloneable,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Receive extends TStructurallyCloneable,
> = {
    name: Name;
    type: ERemoteProcedureType;
};

export enum ERemoteProcedureType {
    Update = 'Update',
    Request = 'Request',
    Subscribe = 'Subscribe',
}

export enum EPlatformSocketRemoteProcedureName {
    // Dictionaries
    ListAssets = 'ListAssets',
    ListInstrumentsV2 = 'ListInstrumentsV2',

    // Product logs
    FetchProductLog = 'FetchProductLog',
    SubscribeToProductLogs = 'SubscribeToProductLogs',

    // Accounts
    CreateAccounts = 'CreateAccounts',
    UpdateAccounts = 'UpdateAccounts',
    CreateVirtualAccounts = 'CreateVirtualAccounts',
    UpdateVirtualAccounts = 'UpdateVirtualAccounts',
    SubscribeToAccounts = 'SubscribeToAccounts',
    SubscribeToVirtualAccounts = 'SubscribeToVirtualAccounts',

    // Indicators
    FetchIndicatorsSnapshot = 'FetchIndicatorsSnapshot',
    SubscribeToIndicators = 'SubscribeToIndicators',

    // Trades
    FetchOwnTrades = 'FetchOwnTrades',
    SubscribeToOwnTrades = 'SubscribeToOwnTrades',

    // Components
    ExecCommand = 'ExecCommand',
    ListGateKinds = 'ListGateKinds',
    RemoveComponent = 'RemoveComponent',
    GetComponentConfig = 'GetComponentConfig',
    FetchComponentState = 'FetchComponentState',
    UpdateComponentState = 'UpdateComponentState',
    SubscribeComponentUpdates = 'SubscribeComponentUpdates',
    SubscribeToComponentConfigUpdates = 'SubscribeToComponentConfigUpdates',
    SubscribeToComponentStateRevisions = 'SubscribeToComponentStateRevisions',
    FetchComponentStateRevisionsHistory = 'FetchComponentStateRevisionsHistory',

    FetchBuildInfoSnapshot = 'FetchBuildInfoSnapshot',

    // Configs
    CreateConfig = 'CreateConfig',
    FetchConfigRevision = 'FetchConfigRevision',
    FetchConfigRevisions = 'FetchConfigRevisions',

    // Orders
    FetchOrdersSnapshot = 'FetchOrdersSnapshot',
    SubscribeToActiveOrders = 'SubscribeToActiveOrders',

    // Robots
    SubscribeToRobotDashboardList = 'SubscribeToRobotDashboardList',

    // Backtesting
    ValidateBacktestTask = 'ValidateBacktestTask',
    UpdateBacktestTask = 'UpdateBacktestTask',
    StopBacktestTask = 'StopBacktestTask',
    StartBacktestTask = 'StartBacktestTask',
    ContinueBacktest = 'ContinueBacktest',
    RemoveBacktestTask = 'RemoveBacktestTask',
    RemoveBacktestTasks = 'RemoveBacktestTasks',
    CreateAndStartBacktestTask = 'CreateAndStartBacktestTask',
    FetchBacktestTaskConfigs = 'FetchBacktestTaskConfigs',
    FetchBacktestTasksSnapshot = 'FetchBacktestTasksSnapshot',
    SubscribeToBacktestTasks = 'SubscribeToBacktestTasks',
    SubscribeToBacktestRuns = 'SubscribeToBacktestRuns',

    // TradingStats
    GetTradingStatsMonth = 'GetTradingStatsMonth', // lol its subscribe...
    SubscribeToTradingStatsDaily = 'SubscribeToTradingStatsDaily',

    // Fetcher
    FetchChunks = 'FetchChunks',

    // Books
    FetchL2BookSnapshot = 'FetchL2BookSnapshot',
    FetchL2BookUpdates = 'FetchL2BookUpdates',

    // Robot
    GetRobotDashboard = 'GetRobotDashboard',
    ListRobotDashboards = 'ListRobotDashboards',

    // Herodotus
    ListHerodotusTrades = 'ListHerodotusTrades',
    GetHerodotusPreRiskData = 'GetHerodotusPreRiskData',
    GetHerodotusReferenceCurrency = 'GetHerodotusReferenceCurrency',
    SubscribeToHerodotusTasks = 'SubscribeToHerodotusTasks',
    FetchHerodotusTasksSnapshot = 'FetchHerodotusTasksSnapshot',

    // DashboardsStorage
    CreateDashboard = 'CreateDashboard',
    UpdateDashboard = 'UpdateDashboard',
    UpdateDashboardScopeBinding = 'UpdateDashboardScopeBinding',
    RenameDashboard = 'RenameDashboard',
    DeleteDashboard = 'DeleteDashboard',
    ResetDashboardDraft = 'ResetDashboardDraft',
    FetchDashboardDraft = 'FetchDashboardDraft',
    UpdateDashboardDraft = 'UpdateDashboardDraft',
    FetchDashboardConfig = 'FetchDashboardConfig',
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

    // authz
    SubscribeToUserSnapshot = 'SubscribeToUserSnapshot',
    SubscribeToPolicySnapshot = 'SubscribeToPolicySnapshot',
    SubscribeToGroupSnapshot = 'SubscribeToGroupSnapshot',

    // Balance Monitor
    SaveCoinState = 'SaveCoinState',
    StopGathering = 'StopGathering',
    StartGathering = 'StartGathering',
    SetTransferRule = 'SetTransferRule',
    SetAutoTransferRule = 'SetAutoTransferRule',
    SetLimitingTransferRule = 'SetLimitingTransferRule',
    DeleteTransferRule = 'DeleteTransferRule',
    DeleteAutoTransferRule = 'DeleteAutoTransferRule',
    DeleteLimitingTransferRule = 'DeleteLimitingTransferRule',
    RequestTransfer = 'RequestTransfer',
    RequestGatheringDetails = 'RequestGatheringDetails',
    RequestInternalTransfer = 'RequestInternalTransfer',
    RequestCoinTransferDetails = 'RequestCoinTransferDetails',
    SubscribeToCoinInfo = 'SubscribeToCoinInfo',
    SubscribeToSuggests = 'SubscribeToSuggests',
    SubscribeToPermissions = 'SubscribeToPermissions',
    SubscribeToPumpDumpInfo = 'SubscribeToPumpDumpInfo',
    SubscribeToTransferRules = 'SubscribeToTransferRules',
    SubscribeToTransferHistory = 'SubscribeToTransferHistory',
    SubscribeToAutoTransferRules = 'SubscribeToAutoTransferRules',
    SubscribeToComponentStatuses = 'SubscribeToComponentStatuses',
    SubscribeToSubAccountBalances = 'SubscribeToSubAccountBalances',
    SubscribeToLimitingTransferRules = 'SubscribeToLimitingTransferRules',
    SubscribeToInternalTransferHistory = 'SubscribeToInternalTransferHistory',
    SubscribeToInternalTransfersCapabilities = 'SubscribeToInternalTransfersCapabilities',

    // Timeseries
    FetchTaggedTimeseriesData = 'FetchTaggedTimeseriesData',
    FetchTimeseriesVisualConfigs = 'FetchTimeseriesVisualConfigs',

    // Instruments
    SubscribeToInstruments = 'SubscribeToInstruments',
    SubscribeToInstrumentsDynamicData = 'SubscribeToInstrumentsDynamicData',
    ApproveInstrument = 'ApproveInstrument',
    SubscribeToAssets = 'SubscribeToAssets',
    ApproveAsset = 'ApproveAsset',
    SubscribeToIndexes = 'SubscribeToIndexes',
    ApproveIndex = 'ApproveIndex',
    SubscribeToInstrumentRevisions = 'SubscribeToInstrumentRevisions',
    FetchInstrumentRevisionsLog = 'FetchInstrumentRevisionsLog',
    FetchInstrumentsSnapshot = 'FetchInstrumentsSnapshot',

    // User Settings
    SubscribeToUserSettings = 'SubscribeToUserSettings',
    UpsertUserSettings = 'UpsertUserSettings',
    RemoveUserSettings = 'RemoveUserSettings',
}
uniqualizeProcedureNames('PlatformSocket', EPlatformSocketRemoteProcedureName);
