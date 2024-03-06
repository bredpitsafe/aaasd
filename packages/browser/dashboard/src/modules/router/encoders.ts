import type { TComponentId } from '@frontend/common/src/types/domain/component';
import type {
    TStorageDashboardId,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { base64ToObject, objectToBase64, TBase64 } from '@frontend/common/src/utils/base64';
import {
    extractValidISO,
    extractValidNumber,
    extractValidString,
} from '@frontend/common/src/utils/extract';
import { isEmpty, isNil } from 'lodash-es';

import type {
    TCommonDashboardRouteParams,
    TDashboardRouteParams,
    TIndicatorsDashboardRouteParams,
    TRobotDashboardRouteParams,
    TUrlParams,
} from '../../types/router';

export function encodeDashboardParams(
    params: TDashboardRouteParams,
): TUrlParams<TDashboardRouteParams> {
    const encoded: TUrlParams<TDashboardRouteParams> = {
        ...encodeCommonDashboardParams(params),
    };

    if (!isEmpty(params.storageId)) {
        encoded.storageId = params.storageId;
    }

    return encoded;
}

export function decodeDashboardParams(
    params: TUrlParams<TDashboardRouteParams>,
): TDashboardRouteParams {
    return {
        storageId: extractValidString(params.storageId) as TStorageDashboardId,
        serverId: extractValidNumber(params.serverId) as TComponentId | undefined,
        ...decodeCommonDashboardParams(params),
    };
}

export function encodeRobotDashboardParams(
    params: TRobotDashboardRouteParams,
): TUrlParams<TRobotDashboardRouteParams> {
    const encoded: TUrlParams<TRobotDashboardRouteParams> = {
        socket: params.socket,
        dashboard: params.dashboard,
        robotId: params.robotId.toString(),
        ...encodeCommonDashboardParams(params),
    };

    if (!isEmpty(params.focusTo)) {
        encoded.focusTo = params.focusTo;
    }

    if (!isEmpty(params.snapshotDate)) {
        encoded.snapshotDate = params.snapshotDate;
    }

    if (!isNil(params.dashboardBacktestingId)) {
        encoded.dashboardBacktestingId = String(params.dashboardBacktestingId);
    }

    return encoded;
}

export function decodeRobotDashboardParams(
    params: TUrlParams<TRobotDashboardRouteParams>,
): TRobotDashboardRouteParams {
    return {
        socket: decodeURIComponent(params.socket) as TSocketName,
        robotId: extractValidNumber(params.robotId) as TRobotId,
        dashboard: decodeURIComponent(params.dashboard) as TStorageDashboardName,
        focusTo: extractValidISO(params.focusTo),
        snapshotDate: extractValidISO(params.snapshotDate),
        dashboardBacktestingId: extractValidNumber(params.dashboardBacktestingId),
        ...decodeCommonDashboardParams(params),
    };
}

export function encodeIndicatorDashboardParams(
    params: TIndicatorsDashboardRouteParams,
): TUrlParams<TIndicatorsDashboardRouteParams> {
    const encoded: TUrlParams<TIndicatorsDashboardRouteParams> = {
        socket: params.socket,
        indicators: params.indicators.length === 1 ? params.indicators[0] : params.indicators,
        ...encodeCommonDashboardParams(params),
    };

    if (!isEmpty(params.focusTo)) {
        encoded.focusTo = params.focusTo;
    }

    return encoded;
}

export function decodeIndicatorDashboardParams(
    params: TUrlParams<TIndicatorsDashboardRouteParams>,
): TIndicatorsDashboardRouteParams {
    return {
        socket: decodeURIComponent(params.socket) as TSocketName,
        indicators: (Array.isArray(params.indicators)
            ? params.indicators
            : [params.indicators]
        ).map((indicator) => decodeURIComponent(indicator)),
        focusTo: extractValidISO(params.focusTo),
        ...decodeCommonDashboardParams(params),
    };
}

function encodeCommonDashboardParams(
    params: TCommonDashboardRouteParams,
): TUrlParams<TCommonDashboardRouteParams> {
    const encoded: TUrlParams<TCommonDashboardRouteParams> = {};

    if (!isNil(params.backtestingId)) {
        encoded.backtestingId = String(params.backtestingId);
    }

    if (!isEmpty(params.position)) {
        encoded.position = objectToBase64(params.position);
    }

    return encoded;
}

function decodeCommonDashboardParams(
    params: TUrlParams<TCommonDashboardRouteParams>,
): TCommonDashboardRouteParams {
    return {
        position: isNil(params.position)
            ? undefined
            : base64ToObject(
                  decodeURIComponent(params.position) as TBase64<TDashboardRouteParams['position']>,
              ),
        backtestingId: extractValidNumber(params.backtestingId),
    };
}
