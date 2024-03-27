import { TGateId } from '@frontend/common/src/types/domain/gates';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';

export type TConfig = {
    server: {
        service: {
            name: string;
            port: number;
            stage: string;
            nodeNo: number;
        };
        oauth: {
            url: string;
            clientId: string;
            login: string;
            password: string;
        };

        component: {
            authenticate: boolean;
            socket: TSocketURL;
            id: TGateId;
        };
    };
};
