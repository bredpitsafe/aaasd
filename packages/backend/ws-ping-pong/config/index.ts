import c from 'config';

export const config = c as unknown as TConfig;

type TConfig = {
    service: {
        name: string;
        port: number;
        stage: string;
        url: string;
    };
    logging: {
        level: string;
    };
};
