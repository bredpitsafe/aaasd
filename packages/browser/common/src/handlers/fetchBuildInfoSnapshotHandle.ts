import { map } from 'rxjs/operators';

import { Nil } from '../types';
import { TBacktestingRun } from '../types/domain/backtestings';
import { TBuildInfo } from '../types/domain/buildInfo';
import { ServerResourceModuleFactory } from '../utils/ModuleFactories/ServerModuleFactory';
import { createSyncedValueDescriptor } from '../utils/ValueDescriptor/utils';

export type TBacktestingRunRobotBuildInfo = {
    kind: string;
    buildInfo:
        | Nil
        | {
              version: string;
              commit: string;
              repoUrlPath: string;
          };
};

export type TBacktestingRunBuildInfoSnapshotNode = {
    nodeNo: number;
    launchNo: number;
    core: Nil | TBuildInfo;
    robots: TBacktestingRunRobotBuildInfo[];
};

export type TBacktestingRunBuildInfoSnapshot = {
    btRunNo: TBacktestingRun['btRunNo'];
    nodes: TBacktestingRunBuildInfoSnapshotNode[];
};

type TSendBody = {
    filters: {
        btRuns: TBacktestingRun['btRunNo'][];
    };
};

type TReceiveBody = {
    btRuns: TBacktestingRunBuildInfoSnapshot[];
};

export const ModuleFetchBuildInfoSnapshotResource = ServerResourceModuleFactory<
    TSendBody,
    TReceiveBody
>('FetchBuildInfoSnapshot')(() => {
    return {
        extendPipe: map((response) => createSyncedValueDescriptor(response.payload.btRuns)),
    };
});
