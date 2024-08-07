import { extractValidNumber } from '@common/utils/src/extract.ts';
import { decodeTypicalParams } from '@frontend/common/src/modules/router/encoders';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';

import type { THerodotusTerminalParams, THerodotusTerminalRouteParams } from './def';

export const decodeParams = (params: THerodotusTerminalRouteParams): THerodotusTerminalParams => {
    try {
        return {
            ...params,
            ...decodeTypicalParams(params),
            robot: extractValidNumber<TRobotId>(params.robot),
        } as THerodotusTerminalParams;
    } catch (e) {
        throw new Error(`Failed to decode route params: ${e}`);
    }
};
