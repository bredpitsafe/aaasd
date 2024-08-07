export type TAppConfig = {
    service: {
        grpcPort: number;
        httpPort: number;
        name: string;
        nodeNo: number;
        healthcheckURL: string;
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
