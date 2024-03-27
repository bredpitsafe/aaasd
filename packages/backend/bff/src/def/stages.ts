import { Opaque } from '@backend/utils/src/util-types.ts';

export type TStageName = Opaque<'StageName', string>;

/**
 * @public
 */
export enum EStageCategory {
    Platform = 'platform',
}

/**
 * @public
 */
export enum EStageEnv {
    Development = 'development',
    Production = 'production',
}

export type WithRequestStage<T> = T & {
    requestStage: TStageName;
};

/**
 * @public
 */
export type TStagesByEnv = Record<EStageEnv, TStageName[]>;

export type TStages = Record<EStageCategory, TStagesByEnv>;

/**
 * @public
 */
export type TStageHostname = Opaque<'StageHostname', string>;

export type TStageConfig = {
    hostname: TStageHostname;
    env: EStageEnv;
    category: EStageCategory;
};
