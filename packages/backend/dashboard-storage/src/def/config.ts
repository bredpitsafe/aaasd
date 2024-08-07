import type { EAppEnv } from '@common/types';

export type TConfig = {
    service: {
        name: string;
        host: string;
        port: number;
        httpServerPort: number;
        env: EAppEnv;
        httpHealthcheckURL: string;
    };
    rpc: {
        timeout: number;
    };
    postgres: {
        host: string;
        port: number;
        databaseName: string;
        username: string;
        password: string;
        minPoolSize: number;
        maxPoolSize: number;
        idleTimeout: number;
        connectionTimeout: number;
        allowExitOnIdle: boolean;
        maxConcurrentQueries: number;
        maxQueueSize: number;
        scheme: string;
    };
    metrics: {
        url: string;
        prefix: string;
        labels: [string, string][];
    };
    logging: {
        level: string;
    };
};
