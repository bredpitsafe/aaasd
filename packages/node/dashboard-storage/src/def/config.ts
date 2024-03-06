import { TOpenIdURL } from '@bhft/keycloak/src/def/index.ts';

export type TConfig = {
    service: {
        name: string;
        port: number;
        stage: string;
        nodeNo: number;
        url: string;
        healthcheckURL: string;
    };
    oauth: {
        devUrl: TOpenIdURL;
        prodUrl: TOpenIdURL;
        tokenCacheCheckInterval: number;
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
    subscriptions: {
        timeout: number;
        checkDraftsInterval: number;
        checkDashboardsInterval: number;
        checkPermissionsInterval: number;
        retryBeforeFail: number;
        retryDelay: number;
        bufferDelay: number;
    };
    authentication: {
        checkExpirationInterval: number;
        socketDeauthCloseTimeout: number;
    };
    heartbeat: {
        enable: boolean;
        interval: number;
    };
};
