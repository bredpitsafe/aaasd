import type { ISO, TimeZone } from '@common/types';
import { EApplicationName, EApplicationURL, EDateTimeFormats } from '@common/types';
import { objectToBase64 } from '@common/utils/src/base64.ts';
import dayjs from 'dayjs';
import { isNil } from 'lodash-es';

import type { THerodotusTask, THerodotusTaskId } from '../../../herodotus/src/types/domain';
import type { TRobotDashboard } from '../modules/actions/def.ts';
import type { TIndicator } from '../modules/actions/indicators/defs';
import type { TBacktestingRunId } from '../types/domain/backtestings';
import type { TRobotId } from '../types/domain/robots';
import type { TSocketName } from '../types/domain/sockets';
import { isMultiPortDevelopment } from './environment';
import { APP_ROOT_PATH, appNameToAppURL, IS_ROOT_ROUTING } from './getPathToRoot.ts';

export const GITLAB_URL = 'https://gitlab.advsys.work';

// DON'T CHANGE KEYS, IT BROKE ROUTER at herodotus-trades
type TURLProps = {
    socket?: TSocketName;
    name?: string;
    taskId?: THerodotusTaskId;
    robotId?: TRobotId;
    focusTo?: ISO;
    dashboard?: TRobotDashboard['name'];
    backtestingId?: TBacktestingRunId;
    dashboardBacktestingId?: TBacktestingRunId;
    indicators?: TIndicator['name'] | TIndicator['name'][];
    date?: ISO;
    from?: ISO;
    to?: ISO;
    tab?: string;
    createTab?: boolean;
    timeZone?: TimeZone;
    snapshotDate?: ISO;
    query?: string;
    scope?: string;
};

export function getAppUrl(appName: EApplicationURL): string {
    return appName + (IS_ROOT_ROUTING ? '' : '.html');
}

function getURL(baseUrl: string, props: TURLProps): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(props)) {
        if (isNil(value)) continue;

        if (Array.isArray(value)) {
            for (const v of value) {
                params.append(key, String(v));
            }
        } else {
            params.append(key, String(value));
        }
    }

    // URLSearchParams encodes space with '+' instead of '%20'.
    // Replace that to allow decoding query params with decodeURIComponent
    const query = params.toString().replace(/\+/g, '%20');

    return `${baseUrl}?${query}`;
}

export function getRobotDashboardURL(
    props: Required<Pick<TURLProps, 'socket' | 'dashboard' | 'robotId'>> &
        Pick<TURLProps, 'backtestingId' | 'dashboardBacktestingId' | 'focusTo' | 'snapshotDate'>,
): string {
    const baseUrl = getBaseUrl(process.env.DEV_PORT_HERO_DASHBOARD);
    return getURL(`${baseUrl}/${getAppUrl(EApplicationURL.Dashboard)}/robotDashboard`, props);
}

export function getHeroTradesURL(
    props: Required<Pick<TURLProps, 'socket' | 'name' | 'robotId' | 'taskId' | 'timeZone'>>,
): string {
    const baseUrl = getBaseUrl(process.env.DEV_PORT_HERO_TRADES);
    return getURL(`${baseUrl}/${getAppUrl(EApplicationURL.HerodotusTrades)}/`, props);
}

export function getIndicatorsDashboardURL(
    indicators: TIndicator['name'] | TIndicator['name'][],
    socket?: TSocketName,
    focusTo?: ISO,
    backtestingId?: number,
): string {
    const baseUrl = getBaseUrl(process.env.DEV_PORT_HERO_DASHBOARD);
    return getURL(`${baseUrl}/${getAppUrl(EApplicationURL.Dashboard)}/indicatorsDashboard`, {
        socket,
        indicators,
        focusTo,
        backtestingId,
    });
}

export function getTradingStatsDailyURL(
    socket: TSocketName,
    startTime?: ISO | null,
    endTime?: ISO | null,
    backtestingId?: TBacktestingRunId,
): string {
    const baseUrl = getBaseUrl();

    const startISO = isNil(startTime)
        ? undefined
        : (dayjs(startTime).format(EDateTimeFormats.Date) as ISO);
    const endISO = isNil(endTime)
        ? undefined
        : (dayjs(endTime).format(EDateTimeFormats.Date) as ISO);
    return getURL(`${baseUrl}/${getAppUrl(EApplicationURL.TradingStats)}/${socket}/daily`, {
        date: startISO,
        from: startISO,
        to: endISO,
        backtestingId,
    });
}

export function getHeroTabName(
    props: Pick<THerodotusTask, 'taskId' | 'taskType' | 'asset'> & { amount: number },
): string {
    return `№${props.taskId}: ${props.taskType} ${props.amount} ${props.asset}`;
}

function getBaseUrl(port?: string): string {
    return isMultiPortDevelopment() ? `https://localhost:${port}` : APP_ROOT_PATH;
}

export function getGitlabRepoURL(repoPath: string, commit?: string) {
    return new URL(`${GITLAB_URL}/${repoPath}${commit ? `/-/commit/${commit}` : ''}`);
}

export function getGitlabRobotRepoURL(repoPath: string, commit?: string) {
    return new URL(`${GITLAB_URL}/${repoPath}${commit ? `#${commit}` : ''}`);
}

export function getWSQueryTerminalUrl(socket: TSocketName, query?: object): string {
    const baseUrl = getBaseUrl();

    return getURL(`${baseUrl}/${getAppUrl(EApplicationURL.WSQueryTerminal)}/${socket}/terminal`, {
        query: isNil(query)
            ? undefined
            : encodeURIComponent(objectToBase64(JSON.stringify(query, null, 2))),
    });
}

export function getScopedDashboardsURL(scope?: object) {
    return getURL(`${getAppRootUrl(EApplicationName.Dashboard)}/`, {
        scope: !isNil(scope) ? objectToBase64(scope) : undefined,
    });
}

export function getAppIconUrl(appName: EApplicationName): string {
    return `${APP_ROOT_PATH}/${appNameToAppURL(appName)}-96.png`;
}

export function getAppRootUrl(appName: EApplicationName): string {
    return `${getBaseUrl()}/${getAppUrl(appNameToAppURL(appName))}`;
}

export function getAppSocketUrl(appName: EApplicationName, socket: TSocketName): string {
    return `${getAppRootUrl(appName)}/${socket}`;
}
