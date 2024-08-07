import type { Nil } from '@common/types';

export type TBuildInfo = {
    commit: string;
    version: string;
    buildId: string;
};

export type TRobotBuildInfo = { commit: string; repoUrlPath: string; version: string };

export type TWithBuildInfo = {
    buildInfo: Nil | TBuildInfo;
};

export type TWithRobotBuildInfo = {
    buildInfo: Nil | TRobotBuildInfo;
};
