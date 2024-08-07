import type { TBase64 } from '@common/utils/src/base64.ts';
import { base64ToObject, objectToBase64 } from '@common/utils/src/base64.ts';
import {
    decodeTypicalParams,
    encodeTypicalParams,
} from '@frontend/common/src/modules/router/encoders';
import { isNil } from 'lodash-es';

import type { TWSQueryTerminalParams, TWSQueryTerminalRouteParams } from './def';

export function encodeParams(params: TWSQueryTerminalParams): TWSQueryTerminalRouteParams {
    try {
        const parsedParams = {
            ...(params as unknown as TWSQueryTerminalRouteParams),
            ...encodeTypicalParams(params),
        };

        if (!isNil(params.query)) {
            try {
                parsedParams.query = encodeURIComponent(objectToBase64(params.query));
            } catch (e) {}
        }

        return parsedParams;
    } catch (e) {
        return params as unknown as TWSQueryTerminalRouteParams;
    }
}

export function decodeParams(params: TWSQueryTerminalRouteParams): TWSQueryTerminalParams {
    try {
        const parsedParams = {
            ...(params as unknown as TWSQueryTerminalParams),
            ...decodeTypicalParams(params),
        };
        if (!isNil(params.query)) {
            try {
                parsedParams.query = base64ToObject(
                    decodeURIComponent(params.query) as TBase64<string>,
                );
            } catch (e) {}
        }

        return parsedParams;
    } catch (e) {
        return params as unknown as TWSQueryTerminalParams;
    }
}
