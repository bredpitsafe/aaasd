import { objectToBase64 } from '@common/utils/src/base64.ts';
import { extractValidObjectFromBase64, extractValidString } from '@common/utils/src/extract.ts';
import {
    decodeTypicalParams,
    encodeTypicalParams,
} from '@frontend/common/src/modules/router/encoders';
import { isEmpty, isNil } from 'lodash-es';

import type {
    TAllBalanceMonitorRouteParams,
    TEncodedBalanceMonitorRouteParams,
    TEncodedInternalTransfersRouteParams,
} from './def';
import { EBalanceMonitorSearchParams, EInternalTransfersSearchParams } from './def';

export const encodeBalanceMonitorParams = (
    params: TAllBalanceMonitorRouteParams,
): TEncodedBalanceMonitorRouteParams => {
    const encoded = encodeTypicalParams(params) as TEncodedBalanceMonitorRouteParams;

    encoded[EBalanceMonitorSearchParams.Coin] =
        EBalanceMonitorSearchParams.Coin in params &&
        !isEmpty(params[EBalanceMonitorSearchParams.Coin])
            ? params[EBalanceMonitorSearchParams.Coin]
            : undefined;

    const manualTransfer =
        EBalanceMonitorSearchParams.ManualTransfer in params
            ? params[EBalanceMonitorSearchParams.ManualTransfer]
            : undefined;

    encoded[EBalanceMonitorSearchParams.ManualTransfer] =
        isNil(manualTransfer) || isEmpty(manualTransfer)
            ? undefined
            : objectToBase64(manualTransfer);

    return encoded;
};

export const decodeBalanceMonitorParams = (
    params: TEncodedBalanceMonitorRouteParams,
): TAllBalanceMonitorRouteParams => {
    return {
        ...params,
        ...decodeTypicalParams(params),
        [EBalanceMonitorSearchParams.Coin]: extractValidString(
            params[EBalanceMonitorSearchParams.Coin],
        ),
        [EBalanceMonitorSearchParams.ManualTransfer]: extractValidObjectFromBase64(
            params[EBalanceMonitorSearchParams.ManualTransfer],
        ),
    } as TAllBalanceMonitorRouteParams;
};

export const encodeInternalTransfersParams = (
    params: TAllBalanceMonitorRouteParams,
): TEncodedInternalTransfersRouteParams => {
    const encoded = encodeTypicalParams(params) as TEncodedInternalTransfersRouteParams;

    const internalTransfer =
        EInternalTransfersSearchParams.InternalTransfer in params
            ? params[EInternalTransfersSearchParams.InternalTransfer]
            : undefined;

    encoded[EInternalTransfersSearchParams.InternalTransfer] =
        isNil(internalTransfer) || isEmpty(internalTransfer)
            ? undefined
            : objectToBase64(internalTransfer);

    return encoded;
};

export const decodeInternalTransfersParams = (
    params: TEncodedInternalTransfersRouteParams,
): TAllBalanceMonitorRouteParams => {
    return {
        ...params,
        ...decodeTypicalParams(params),
        [EInternalTransfersSearchParams.InternalTransfer]: extractValidObjectFromBase64(
            params[EInternalTransfersSearchParams.InternalTransfer],
        ),
    } as TAllBalanceMonitorRouteParams;
};
