import { EApplicationName, EApplicationTitle, EApplicationURL } from '@common/types';
import { assertNever } from '@common/utils/src/assert.ts';
import { isEmpty } from 'lodash-es';

import { isDevelopment, isMultiStageDomain } from './environment.ts';
import { getLocation } from './location.ts';

export const APP_ROOT_PATH = (() => {
    const path = String(process.env.ROOT_PATH).replaceAll(/\/+$/g, '');

    if (isEmpty(path)) {
        return path;
    }

    const pathParts = path.split('/');

    if (pathParts.length === 0) {
        return path;
    }

    const location = getLocation('pathname').split('/');

    if (pathParts.length > location.length) {
        return path;
    }

    return location.slice(0, pathParts.length).join('/').replaceAll(/\/+$/g, '');
})();

export function getAppPath(appName: EApplicationName): string {
    const locationString = getLocation('pathname');
    const appNamePath = appNameToAppURL(appName);
    const parts = locationString.split('/');

    const appIndex = parts.findIndex((part) => part.startsWith(appNamePath));

    if (appIndex >= 0) {
        return parts.slice(0, appIndex + 1).join('/');
    }

    return `${APP_ROOT_PATH}/${appNamePath}${isMultiStageDomain() ? '.html' : ''}`;
}

export function appNameToAppURL(appName: EApplicationName): EApplicationURL {
    switch (appName) {
        case EApplicationName.TradingServersManager:
            return EApplicationURL.TradingServersManager;
        case EApplicationName.BalanceMonitor:
            return EApplicationURL.BalanceMonitor;
        case EApplicationName.BacktestingManager:
            return EApplicationURL.BacktestingManager;
        case EApplicationName.HerodotusDashboard:
            return EApplicationURL.HerodotusDashboard;
        case EApplicationName.HerodotusTerminal:
            return EApplicationURL.HerodotusTerminal;
        case EApplicationName.HerodotusTrades:
            return EApplicationURL.HerodotusTrades;
        case EApplicationName.Dashboard:
            return EApplicationURL.Dashboard;
        case EApplicationName.TradingStats:
            return EApplicationURL.TradingStats;
        case EApplicationName.WSQueryTerminal:
            return EApplicationURL.WSQueryTerminal;
        case EApplicationName.Authz:
            return EApplicationURL.Authz;
        case EApplicationName.Index:
            return EApplicationURL.Index;
        case EApplicationName.Settings:
        case EApplicationName.Common:
            throw new Error(`Application "${appName}" doesn't have URL in EApplicationURL`);
        default:
            assertNever(appName);
    }
}

export function appNameToAppTitle(appName: EApplicationName): EApplicationTitle {
    switch (appName) {
        case EApplicationName.Authz:
            return EApplicationTitle.Authz;
        case EApplicationName.Settings:
            return EApplicationTitle.Settings;
        case EApplicationName.Dashboard:
            return EApplicationTitle.Dashboard;
        case EApplicationName.BacktestingManager:
            return EApplicationTitle.BacktestingManager;
        case EApplicationName.TradingServersManager:
            return EApplicationTitle.TradingServersManager;
        case EApplicationName.TradingStats:
            return EApplicationTitle.TradingStats;
        case EApplicationName.HerodotusDashboard:
            return EApplicationTitle.HerodotusDashboard;
        case EApplicationName.HerodotusTerminal:
            return EApplicationTitle.HerodotusTerminal;
        case EApplicationName.HerodotusTrades:
            return EApplicationTitle.HerodotusTrades;
        case EApplicationName.BalanceMonitor:
            return EApplicationTitle.BalanceMonitor;
        case EApplicationName.WSQueryTerminal:
            return EApplicationTitle.WSQueryTerminal;
        case EApplicationName.Index:
            return EApplicationTitle.Index;
        default:
            throw new Error(`Unhandled application name: ${appName}`);
    }
}

export const IS_ROOT_ROUTING = Boolean(process.env.IS_ROOT_ROUTING);

export const APP_BUILD_ID = (() => {
    if (isDevelopment()) {
        return 'dev';
    }

    if (IS_ROOT_ROUTING) {
        return 'prod';
    }

    return APP_ROOT_PATH.split('/').at(1);
})();
