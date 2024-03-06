import { Nil } from '../index';

export type TBuildInfo = {
    commit: string;
    version: string;
    buildId: string;
};

export type TWithBuildInfo = {
    buildInfo: Nil | TBuildInfo;
};
