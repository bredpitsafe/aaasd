import { TOpenIdURL } from '@bhft/keycloak/src/def/index.ts';

import { EGrpcClientName } from './grpcClients.ts';
import { TStageConfig, TStageName } from './stages.ts';

export type TAppConfig = {
    service: {
        stage: string;
        name: string;
        port: number;
        nodeNo: number;
        url: string;
        healthcheckURL: string;
    };
    oauth: {
        devUrl: TOpenIdURL;
        prodUrl: TOpenIdURL;
        tokenCacheCheckInterval: number;
    };
    metrics: {
        url: string;
        prefix: string;
        labels: [string, string][];
    };
    logging: {
        level: string;
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
    stages: Record<TStageName, TStageConfig>;
    resources: {
        grpc: {
            defaultPort: number;
            services: Record<EGrpcClientName, string>;
        };
    };
};
