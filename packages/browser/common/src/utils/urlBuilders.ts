import dayjs from 'dayjs';
import { isNil } from 'lodash-es';

import { THerodotusTask, THerodotusTaskId } from '../../../herodotus/src/types/domain';
import type { TRobotDashboard } from '../handlers/def';
import type { TIndicator } from '../modules/actions/indicators/defs';
import type { TBacktestingRunId } from '../types/domain/backtestings';
import type { TRobotId } from '../types/domain/robots';
import type { TSocketName } from '../types/domain/sockets';
import type { ISO, TimeZone } from '../types/time';
import { EDateTimeFormats } from '../types/time';
import { isMultiPortDevelopment } from './environment';
import { getServerDistLocation } from './location';

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
};

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
    return getURL(`${baseUrl}/dashboard.html/robotDashboard`, props);
}

export function getHeroTradesURL(
    props: Required<Pick<TURLProps, 'socket' | 'name' | 'robotId' | 'taskId' | 'timeZone'>>,
): string {
    const baseUrl = getBaseUrl(process.env.DEV_PORT_HERO_TRADES);
    return getURL(`${baseUrl}/herodotus-trades.html/`, props);
}

export function getIndicatorsDashboardURL(
    indicators: TIndicator['name'] | TIndicator['name'][],
    socket?: TSocketName,
    focusTo?: ISO,
    backtestingId?: number,
): string {
    const baseUrl = getBaseUrl(process.env.DEV_PORT_HERO_DASHBOARD);
    return getURL(`${baseUrl}/dashboard.html/indicatorsDashboard`, {
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
    return getURL(`${baseUrl}/trading-stats.html/${socket}/daily`, {
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
    return isMultiPortDevelopment() ? `https://localhost:${port}` : getServerDistLocation();
}

export function getGitlabRepoURL(repoPath: string, commit?: string) {
    return new URL(`${GITLAB_URL}/${repoPath}${commit ? `/-/commit/${commit}` : ''}`);
}

export function getWSQueryTerminalUrl(socket: TSocketName): string {
    const baseUrl = getBaseUrl(process.env.DEV_PORT_HERO_DASHBOARD);
    return getURL(`${baseUrl}/ws-query-terminal.html/${socket}`, {});
}
