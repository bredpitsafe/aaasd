import {
    decodeTypicalParams,
    encodeTypicalParams,
} from '@frontend/common/src/modules/router/encoders';
import { objectToBase64 } from '@frontend/common/src/utils/base64';
import {
    extractValidObjectFromBase64,
    extractValidString,
} from '@frontend/common/src/utils/extract';
import { isEmpty, isNil } from 'lodash-es';

import type { TAllBalanceMonitorRouteParams, TEncodedBalanceMonitorRouteParams } from './def';
import { EBalanceMonitorSearchParams } from './def';

export const encodeParams = (
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

export const decodeParams = (
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
    };
};
