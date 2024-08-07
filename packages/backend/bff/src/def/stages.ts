import type { EApplicationName, Opaque } from '@common/types';

import type { EGrpcClientName } from './grpcClients.ts';

export type TStageName = Opaque<'StageName', string>;

/**
 * @public
 */
export enum EStageCategory {
    // Platform stage that may contain multiple stage-specific services (Trading Data Provider, Instruments, etc.)
    Platform = 'platform',
    // Stage contains a single service (e.g. Dashboard Storage, User Settings, etc.)
    Service = 'service',
    // Stage contains only a client-side socket, but no GRPC services (e.g. ATF)
    Client = 'client',
}

/**
 * @public
 */
export enum EStageEnv {
    // Multi-stage environment, used for dev branch deployment & running tests
    MS = 'ms',
    // Production environment, used for real trading
    Prod = 'prod',
    // Single-instance services, used both for Prod and MS environments
    SingleInstance = 'singleInstance',
    // Dev services, used only for local development (e.g. localhost-based)
    Dev = 'dev',
}

export type WithRequestStage<T> = T & {
    requestStage: TStageName;
};

/**
 * @public
 */
export type TStageHostname = Opaque<'StageHostname', string>;

export type TStageConfig = {
    name: TStageName;
    hostname?: TStageHostname;
    env: EStageEnv;
    category: EStageCategory;
    skipAuth?: boolean;
    clientSocket?: string;
    clientApps?: EApplicationName[];
    grpcClients?: EGrpcClientName[];
};
