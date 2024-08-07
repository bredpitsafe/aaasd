import type { TAllTypicalRouteParams } from '@frontend/common/src/modules/router/defs';
import {
    decodeTypicalParams,
    encodeTypicalParams,
} from '@frontend/common/src/modules/router/encoders';

import type { TAuthzRouteParams, TEncodedAuthzParams } from './def';

export const decodeParams = (params: TAuthzRouteParams): TAuthzRouteParams => {
    try {
        const parsedParams = {
            ...(params as unknown as TEncodedAuthzParams),
            ...decodeTypicalParams(params as unknown as TEncodedAuthzParams),
        };

        return parsedParams as TAuthzRouteParams;
    } catch (e) {
        throw new Error(`Failed to decode route params: ${e}`);
    }
};

export function encodeParams(params: TEncodedAuthzParams): TAuthzRouteParams {
    try {
        const parsedParams = {
            ...(params as unknown as TEncodedAuthzParams),
            ...encodeTypicalParams(params as unknown as TAllTypicalRouteParams),
        };

        return parsedParams as TAuthzRouteParams;
    } catch (e) {
        return params as unknown as TAuthzRouteParams;
    }
}
