import type { Nil } from '@common/types';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import type { TReceivedData } from '@frontend/common/src/lib/BFFSocket/def.ts';
import type { TBacktestingRun } from '@frontend/common/src/types/domain/backtestings';
import type { TBuildInfo, TRobotBuildInfo } from '@frontend/common/src/types/domain/buildInfo.ts';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import hash_sum from 'hash-sum';
import type { OperatorFunction } from 'rxjs';

export type TBacktestingRunRobotBuildInfo = {
    kind: string;
    buildInfo: Nil | TRobotBuildInfo;
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

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchBuildInfoSnapshot,
    ERemoteProcedureType.Request,
);

export const ModuleFetchBacktestingRunsBuildInfo = createRemoteProcedureCall(descriptor)({
    getParams: ({ target, btRuns }: { target: TSocketURL; btRuns: TBacktestingRun[] }) => ({
        target,
        filters: {
            btRuns: btRuns.map(({ btRunNo }) => btRunNo),
        },
    }),
    getPipe: (): OperatorFunction<
        TValueDescriptor2<TReceivedData<TReceiveBody>>,
        TValueDescriptor2<TBacktestingRunBuildInfoSnapshot[]>
    > =>
        mapValueDescriptor(
            ({
                value: {
                    payload: { btRuns },
                },
            }) => createSyncedValueDescriptor(btRuns),
        ),
    dedobs: {
        normalize: ([params]) =>
            hash_sum({
                target: params.target,
                // We should only get a different hash if the set of BT run identifiers changes or their status changes; in other cases,
                // the hash should match to reduce the number of BuildInfo requests."
                btRuns: params.btRuns?.map(({ btRunNo, status }) => `${btRunNo}:${status}`)?.sort(),
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});
