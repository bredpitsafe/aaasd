import type { DBSchema, IDBPDatabase } from 'idb';

import { ECommonSettings } from '../../components/Settings/def';
import { EApplicationName } from '../../types/app';
import { createDB } from '../../utils/DB/createDB';
import { getDatabaseVersion } from '../../utils/DB/utils';
import { EDatabaseErrorCallbackType, TDatabaseErrorCallback } from '../../utils/Rx/database';
import { ENavType } from './types';

export const settingsDatabaseName = 'SETTINGS' as const;

const currentSettingsDatabaseVersion = 6;
const NAV_COLLAPSED_TO_TYPE_VERSION = 6;

type TSettingsData = {
    key: string;
    value: unknown;
};

export const commonSettingsStoreName = 'common' as const;
export const wsQueryTerminalSettingsStoreName = 'wsQueryTerminal' as const;
export const settingsStoreNames = <const>[
    commonSettingsStoreName,
    wsQueryTerminalSettingsStoreName,
    EApplicationName.Dashboard,
    EApplicationName.BacktestingManager,
    EApplicationName.TradingServersManager,
    EApplicationName.TradingStats,
    EApplicationName.PortfolioTracker,
    EApplicationName.HerodotusDashboard,
    EApplicationName.HerodotusTerminal,
    EApplicationName.HerodotusTrades,
    EApplicationName.BalanceMonitor,
];

export type TSettingsStoreName = (typeof settingsStoreNames)[number];

export type ISettingsSchema = DBSchema & Record<TSettingsStoreName, TSettingsData>;

export async function createSettingsDB(
    dbCallback: TDatabaseErrorCallback,
): Promise<IDBPDatabase<ISettingsSchema>> {
    const requestedVersion = Math.max(
        (await getDatabaseVersion(settingsDatabaseName)) ?? 0,
        currentSettingsDatabaseVersion,
    );

    return createDB<ISettingsSchema>(settingsDatabaseName, requestedVersion, {
        blocked: () => dbCallback(EDatabaseErrorCallbackType.Blocked),
        blocking: () => dbCallback(EDatabaseErrorCallbackType.Blocking),
        terminated: () => dbCallback(EDatabaseErrorCallbackType.Terminated),
        async upgrade(
            database: IDBPDatabase<ISettingsSchema>,
            oldVersion: number,
            newVersion: number | null,
            transaction,
        ) {
            for (const name of settingsStoreNames) {
                const settingsStore =
                    oldVersion > 0 && database.objectStoreNames.contains(name)
                        ? transaction.objectStore(name)
                        : database.createObjectStore(name);

                if (oldVersion < NAV_COLLAPSED_TO_TYPE_VERSION) {
                    await settingsStore.get(ECommonSettings.NavCollapsed).then((v) => {
                        if (v === true)
                            return settingsStore.put(ENavType.Small, ECommonSettings.NavType);
                        if (v === false)
                            return settingsStore.put(ENavType.Full, ECommonSettings.NavType);
                    });
                }
            }
        },
    });
}
