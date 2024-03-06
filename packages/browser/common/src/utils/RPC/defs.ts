export enum ERemoteProcedureType {
    Update = 'Update',
    Request = 'Request',
    Subscribe = 'Subscribe',
}

export enum EServerRemoteProcedureName {
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

    FetchConvertRatesSnapshot = 'FetchConvertRatesSnapshot',
    SubscribeToConvertRates = 'SubscribeToConvertRates',

    // Books
    FetchL2BookSnapshot = 'FetchL2BookSnapshot',
    FetchL2BookUpdates = 'FetchL2BookUpdates',
}

export enum EActorRemoteProcedureName {
    ReloadAllTabs = 'ReloadAllTabs',

    GetBacktestingTaskConfigs = 'GetBacktestingTaskConfigs',
    SubscribeToBacktestingTask = 'SubscribeToBacktestingTask',
    SubscribeToBacktestingRun = 'SubscribeToBacktestingRun',
    GetChartPoints = 'GetChartPoints',

    GetIndicatorsItems = 'GetIndicatorsItems',
    SubscribeToIndicatorsUpdates = 'SubscribeToIndicatorsUpdates',
}
