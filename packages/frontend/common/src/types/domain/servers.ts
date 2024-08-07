import type { ISO, Opaque } from '@common/types';

import type { TWithBuildInfo } from './buildInfo';
import type { EComponentStatus } from './component';
import type { TGateId } from './gates';
import type { TRobotId } from './robots';

export type TServerId = Opaque<'ServerId', number>;

export type TServer = TWithBuildInfo & {
    id: TServerId;
    name: string;

    status: EComponentStatus;
    statusMessage: null | string;

    execGateIds: TGateId[];
    mdGateIds: TGateId[];
    robotIds: TRobotId[];

    version?: string;

    startTime?: ISO;
};
