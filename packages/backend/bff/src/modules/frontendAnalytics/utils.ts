import type { TBasicLogger } from '@backend/utils/src/logger';
import { assertNever } from '@common/utils';

import { ELogLevel } from './defs';

export const toLoggerMethod = (
    frontendLogLevel: ELogLevel,
): keyof Omit<TBasicLogger, 'createChildLogger'> => {
    switch (frontendLogLevel) {
        case ELogLevel.Info:
            return 'info';
        case ELogLevel.Warn:
            return 'warn';
        case ELogLevel.Error:
            return 'error';
        case ELogLevel.Debug:
            return 'debug';
        default:
            assertNever(frontendLogLevel);
    }
};
