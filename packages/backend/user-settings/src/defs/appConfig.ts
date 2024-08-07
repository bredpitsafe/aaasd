export type TAppConfig = {
    service: {
        name: string;
        host: string;
        port: number;
        httpServerPort: number;
        env: string;
        httpHealthcheckURL: string;
    };
    postgres: {
        host: string;
        port: number;
        username: string;
        password: string;
        databaseName: string;
        schema: string;
    };
    metrics: {
        url: string;
    };
    logging: {
        level: string;
    };
};
