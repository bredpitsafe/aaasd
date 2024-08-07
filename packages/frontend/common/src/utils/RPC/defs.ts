import { uniqualizeProcedureNames } from '@common/rpc';

export { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';

export enum EActorRemoteProcedureName {
    // Session
    SessionLogin = 'SessionLogin',
    SessionLogout = 'SessionLogout',
    SubscribeToSession = 'SubscribeToSession',
    SubscribeToSessionUser = 'SubscribeToSessionUser',
    SubscribeToSessionToken = 'SubscribeToSessionToken',

    // Keycloak
    KeycloakLogin = 'KeycloakLogin',
    KeycloakLogout = 'KeycloakLogout',
    KeycloakRelogin = 'KeycloakRelogin',
    PublishKeycloakToken = 'PublishKeycloakToken',
    PublishKeycloakProfile = 'PublishKeycloakProfile',

    // Authz
    SubscribeToUsersSnapshot = 'SubscribeToUsersSnapshot',
    SubscribeToGroupsSnapshot = 'SubscribeToGroupsSnapshot',
    SubscribeToPoliciesSnapshot = 'SubscribeToPoliciesSnapshot',

    // Dictionaries
    FetchAssets = 'FetchAssets',
    FetchInstruments = 'FetchInstruments',

    // Backtesting
    GetBacktestingTaskConfigs = 'GetBacktestingTaskConfigs',
    SubscribeToBacktestingTask = 'SubscribeToBacktestingTask',
    SubscribeToBacktestingRun = 'SubscribeToBacktestingRun',
    RequestBacktestingTaskItems = 'RequestBacktestingTaskItems',
    SubscribeToBacktestingTaskUpdates = 'SubscribeToBacktestingTaskUpdates',

    // Chart
    GetChartPoints = 'GetChartPoints',
    GetChartTaggedMetadata = 'GetChartTaggedMetadata',

    // FullDashboards
    GetDashboardsLoadState = 'GetDashboardsLoadState',
    GetDashboardsList = 'GetDashboardsList',
    UpdateDashboardScopeBinding = 'UpdateDashboardScopeBinding',
    GetDashboard = 'GetDashboard',
    RegisterExternalDashboard = 'RegisterExternalDashboard',
    CreateDashboard = 'CreateDashboard',
    UpdateDashboard = 'UpdateDashboard',
    UpdateDashboardDraft = 'UpdateDashboardDraft',
    DeleteDashboard = 'DeleteDashboard',
    ResetDashboard = 'ResetDashboard',
    UpdateDashboardShareSettings = 'UpdateDashboardShareSettings',
    DashboardUpdateProgressSet = 'DashboardUpdateProgressSet',
    SubscribeDashboardPermissions = 'SubscribeDashboardPermissions',
    UpdateDashboardPermissions = 'UpdateDashboardPermissions',
    SubscribeDashboardUsers = 'SubscribeDashboardUsers',
    RenameDashboard = 'RenameDashboard',

    // Indicators
    FetchIndicatorsInfinitySnapshot = 'FetchIndicatorsInfinitySnapshot',
    SubscribeToIndicatorsInfinitySnapshot = 'SubscribeToIndicatorsInfinitySnapshot',
    SubscribeToIndicatorsFiniteSnapshot = 'SubscribeToIndicatorsFiniteSnapshot',

    // Components
    SubscribeToComponentsSnapshot = 'SubscribeToComponentsSnapshot',
    FetchComponentStateRevision = 'FetchComponentStateRevision',
    SubscribeToComponentStateRevisions = 'SubscribeToComponentStateRevisions',
    FetchComponentState = 'FetchComponentState',
    FetchGateKinds = 'FetchGateKinds',

    // TradingServersManager
    RequestOrdersItems = 'RequestOrdersItems',
    SubscribeToOrdersUpdates = 'SubscribeToOrdersUpdates',

    // ProductLogs
    RequestProductLogItems = 'RequestProductLogItems',
    SubscribeToProductLogUpdates = 'SubscribeToProductLogUpdates',

    // OwnTrades
    RequestOwnTradeItems = 'RequestOwnTradeItems',
    SubscribeToOwnTradeUpdates = 'SubscribeToOwnTradeUpdates',
}
uniqualizeProcedureNames('Actor', EActorRemoteProcedureName);
