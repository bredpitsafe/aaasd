import type { TOpenIdURL } from '@backend/keycloak/src/def/index.ts';
import type { EAppEnv } from '@common/types';

import type { EGrpcClientName } from './grpcClients.ts';
import type { TStageConfig, TStageName } from './stages.ts';

export type TAppConfig = {
    service: {
        env: EAppEnv;
        name: string;
        port: number;
        nodeNo: number;
        url: string;
        healthcheckURL: string;
        secure: boolean;
    };
    oauth: {
        url: TOpenIdURL;
        secondaryUrl?: TOpenIdURL;
        tokenCacheCheckInterval: number;
    };
    metrics: {
        url: string;
        prefix: string;
        labels: [string, string][];
    };
    csp: {
        url: string;
    };
    logging: {
        level: string;
    };
    frontendAnalytics: {
        sendLogsUrl: string;
    };
    rpc: {
        timeout: number;
    };
    authentication: {
        checkExpirationInterval: number;
    };
    heartbeat: {
        enable: boolean;
        interval: number;
    };
    stages: Record<TStageName, Omit<TStageConfig, 'name'>>;
    resources: {
        grpc: {
            defaultPort: number;
            services: Record<EGrpcClientName, string>;
        };
    };
};
