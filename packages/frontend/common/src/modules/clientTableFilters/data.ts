import type { Opaque } from '@common/types';
import type { DBSchema, IDBPDatabase } from 'idb';

import { createDB } from '../../utils/DB/createDB';
import { createObservableBox } from '../../utils/rx';
import type { TNotificationProps } from '../notifications/def';

export type TTableId = Opaque<'TableId', string>;
export type TFilterTableName = string;
export type TFilterTableValue = Record<string, any>;
export type TFilterValue = Partial<Record<ETableIds | TFilterTableName, TFilterTableValue>>;
export type TFilter = {
    name: TFilterTableName;
    value: TFilterValue;
};

export const DYNAMIC_TABLE_NAME_PREFIX = 'Dynamic_';

export enum ETableIds {
    ActiveTasks = 'activeTasks',
    ActiveTasksNested = 'activeTasksNested',
    ArchivedTasks = 'archivedTasks',
    ArchivedTasksNested = 'archivedTasksNested',
    ActiveOrders = 'activeOrders',
    AllIndicators = 'allIndicators',
    IndicatorsSnapshots = 'indicatorsSnapshots',
    AllInstruments = 'allInstruments',
    VirtualAccounts = 'virtualAccounts',
    VirtualAccountsNested = 'virtualAccountsNested',
    RealAccounts = 'realAccounts',
    RealAccountsNested = 'realAccountsNested',
    Trades = 'trades',
    ProductLogs = 'productLogs',
    Dashboards = 'dashboards',
    DashboardsList = 'dashboardsList',
    DashboardPanelChartProps = 'dashboardPanelChartProps',
    BacktestingTasks = 'BacktestingTasks',
    BacktestingRuns = 'BacktestingRuns',
    BacktestingRunsInfo = 'BacktestingRunsInfo',
    BacktestingRunRobotsBuildInfo = 'BacktestingRunRobotsBuildInfo',
    PNLDaily = 'PNLDaily',
    ARBDaily = 'ARBDaily',
    PNLMonthly = 'PNLMonthly',
    ARBMonthly = 'ARBMonthly',
    PortfolioTrades = 'PortfolioTrades',
    PortfolioPositions = 'PortfolioPositions',
    PortfolioRisks = 'PortfolioRisks',
    PortfolioRho = 'PortfolioRho',
    PortfolioVega = 'PortfolioVega',
    PortfolioGamma = 'PortfolioGamma',
    ServersMenu = 'ServersMenu',
    GatesMenu = 'GatesMenu',
    RobotsMenu = 'RobotsMenu',
    Suggestions = 'Suggestions',
    TransfersHistory = 'TransfersHistory',
    CoinTransferDetails = 'CoinTransferDetails',
    InternalTransfersHistory = 'InternalTransfersHistory',
    TransferBlockingRules = 'TransferBlockingRules',
    AmountLimitsRules = 'AmountLimitsRules',
    ComponentStatuses = 'ComponentStatuses',
    PumpAndDump = 'PumpAndDump',
    AutoTransferRules = 'AutoTransferRules',
    Positions = 'Positions',
    Balances = 'Balances',
    RobotPositions = 'RobotPositions',
    RobotBalances = 'RobotBalances',
    Subscriptions = 'Subscriptions',
    AuthzUsers = 'AuthzUsers',
    AuthzGroups = 'AuthzGroups',
    AuthzPolicies = 'AuthzPolicies',
    InstrumentsStaticData = 'InstrumentsStaticData',
    InstrumentsStaticDataNested = 'InstrumentsStaticDataNested',
    InstrumentsDynamicData = 'InstrumentsDynamicData',
    TransposeInstrumentDetails = 'TransposeInstrumentDetails',
    TransposeProviderInstrumentDetails = 'TransposeProviderInstrumentDetails',
    Assets = 'Assets',
    AssetsNested = 'AssetsNested',
    Indexes = 'Indexes',
    IndexesNested = 'IndexesNested',
    TransposeInstrumentRevisions = 'TransposeInstrumentRevisions',
    TransposeProviderInstrumentRevisions = 'TransposeProviderInstrumentRevisions',
}

const storeName = 'tableFilters';

interface Schema extends DBSchema {
    [storeName]: {
        key: TFilterTableName;
        value: TFilter;
    };
}

let db: IDBPDatabase<Schema> | undefined = undefined;
export const boxFilters = createObservableBox<TFilter[]>([]);

export async function initFilterDatabase(
    error: (props: TNotificationProps) => void,
): Promise<void> {
    db = await createDB<Schema>(storeName, 1, {
        blocked() {
            error({
                message: 'Table clientTableFilters database has been blocked',
                description: 'For correct work you must reload page!',
                popupSettings: {
                    duration: 0,
                },
            });
        },
        blocking() {
            error({
                message: 'Table clientTableFilters database has been blocked',
                description: 'For correct work you must reload page!',
                popupSettings: {
                    duration: 0,
                },
            });
        },
        terminated() {
            error({
                message: 'Table clientTableFilters database has been terminated',
                description: 'For correct work you must reload page!',
                popupSettings: {
                    duration: 0,
                },
            });
        },
        upgrade(database: IDBPDatabase<Schema>, oldVersion: number) {
            if (oldVersion < 1) {
                database.createObjectStore(storeName);
            }
        },
    });

    await syncFiltersWithDB();
}

async function syncFiltersWithDB(): Promise<void> {
    if (db === undefined) {
        throw new Error('clientTableFilters database not initialized');
    }
    const filters = await db.getAll(storeName);
    boxFilters.set(filters);
}

export async function setFilter(filter: TFilter): Promise<void> {
    if (db === undefined) {
        throw new Error('clientTableFilters database not initialized');
    }
    await db.put(storeName, filter, filter.name);
    await syncFiltersWithDB();
}

export async function deleteFilter(filter: TFilter): Promise<void> {
    if (db === undefined) {
        throw new Error('clientTableFilters database not initialized');
    }
    await db.delete(storeName, filter.name);
    await syncFiltersWithDB();
}
