import type { TBase64 } from '@common/utils/src/base64.ts';
import { base64ToObject, objectToBase64 } from '@common/utils/src/base64.ts';
import {
    extractValidISO,
    extractValidNumber,
    extractValidString,
} from '@common/utils/src/extract.ts';
import type {
    TScope,
    TStorageDashboardId,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { isEmpty, isNil } from 'lodash-es';

import type {
    TCommonDashboardRouteParams,
    TDashboardRouteParams,
    TDefaultRouteParams,
    TIndicatorsDashboardRouteParams,
    TRobotDashboardRouteParams,
    TUrlParams,
} from '../../types/router';

export function encodeDefaultRouteParams(
    params: TDefaultRouteParams,
): TUrlParams<TDefaultRouteParams> {
    return { scope: encodeScope(params) };
}

export function decodeDefaultRouteParams(
    params: TUrlParams<TDashboardRouteParams>,
): TDashboardRouteParams {
    return {
        scope: decodeScope(params),
    };
}

export function encodeDashboardParams(
    params: TDashboardRouteParams,
): TUrlParams<TDashboardRouteParams> {
    const encoded: TUrlParams<TDashboardRouteParams> = {
        ...encodeCommonDashboardParams(params),
    };

    if (!isEmpty(params.storageId)) {
        encoded.storageId = params.storageId;
    }

    encoded.scope = encodeScope(params);

    return encoded;
}

export function decodeDashboardParams(
    params: TUrlParams<TDashboardRouteParams>,
): TDashboardRouteParams {
    return {
        storageId: extractValidString(params.storageId) as TStorageDashboardId,
        scope: decodeScope(params),
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

function decodeScope(params: TUrlParams<TDashboardRouteParams>): TScope | undefined {
    return isEmpty(params.scope)
        ? undefined
        : base64ToObject(
              decodeURIComponent(params.scope as string) as TBase64<TDashboardRouteParams['scope']>,
          );
}

function encodeScope(params: TDashboardRouteParams): string | undefined {
    return isEmpty(params.scope) ? undefined : objectToBase64(params.scope);
}
