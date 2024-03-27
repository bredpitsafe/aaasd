import { EComponentStatus, Opaque } from '../index';
import { ISO } from '../time';
import { TWithBuildInfo } from './buildInfo';
import { TGateId } from './gates';
import { TRobotId } from './robots';

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
