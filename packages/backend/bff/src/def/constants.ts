import type { TCorrelationId } from '@backend/utils/src/correlationId.ts';

import type { TStageName } from './stages.ts';

export const UNCAUGHT_ERROR_CORRELATION_ID = 666 as TCorrelationId;

export const STAGE_MOCKS = 'mocks' as TStageName;
