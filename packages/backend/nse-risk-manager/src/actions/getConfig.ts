'use server';

import { getComponentConfigHandle } from '@frontend/common/src/handlers/getComponentConfigHandle';
import { generateTraceId } from '@frontend/common/src/utils/traceId';

import { config } from '../lib/config';
import { fetchHandler } from '../lib/socket';

export const getConfig = (traceId = generateTraceId()) =>
    getComponentConfigHandle(
        fetchHandler,
        config.server.component.socket,
        config.server.component.id,
        0,
        {
            traceId,
        },
    );
