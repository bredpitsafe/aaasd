import { decodeTypicalParams } from '@frontend/common/src/modules/router/encoders';
import { TRobotId } from '@frontend/common/src/types/domain/robots';
import { extractValidNumber } from '@frontend/common/src/utils/extract';

import { THerodotusTerminalParams, THerodotusTerminalRouteParams } from './def';

export const decodeParams = (params: THerodotusTerminalRouteParams): THerodotusTerminalParams => {
    try {
        return {
            ...params,
            ...decodeTypicalParams(params),
            robot: extractValidNumber<TRobotId>(params.robot),
        };
    } catch (e) {
        throw new Error(`Failed to decode route params: ${e}`);
    }
};
