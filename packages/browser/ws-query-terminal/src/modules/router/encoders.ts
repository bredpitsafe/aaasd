import {
    decodeTypicalParams,
    encodeTypicalParams,
} from '@frontend/common/src/modules/router/encoders';
import { type TBase64, base64ToObject, objectToBase64 } from '@frontend/common/src/utils/base64';
import { isNil } from 'lodash-es';

import { TWSQueryTerminalParams, TWSQueryTerminalRouteParams } from './def';

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
