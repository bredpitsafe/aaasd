'use server';

import { generateTraceId } from '@common/utils';
import type { TComponentConfig } from '@frontend/common/src/modules/actions/def';
import type { TBacktestingRun } from '@frontend/common/src/types/domain/backtestings';
import type { TComponentId } from '@frontend/common/src/types/domain/component';

import { config } from '../lib/config';
import { fetchHandler } from '../lib/socket';

type TSendBody = {
    type: 'GetComponentConfig';
    id: TComponentId;
    btRunNo?: TBacktestingRun['btRunNo'];
};

type TReceiveBody = TComponentConfig & {
    type: 'ComponentConfig';
};

export const getConfig = (traceId = generateTraceId()) => {
    return fetchHandler<TSendBody, TReceiveBody>(
        config.server.component.socket,
        {
            type: 'GetComponentConfig',
            id: config.server.component.id,
            btRunNo: 0,
        },
        { traceId },
    );
};
