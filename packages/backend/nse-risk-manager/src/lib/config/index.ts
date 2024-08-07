import type { TGateId } from '@frontend/common/src/types/domain/gates';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';

import type { TConfig } from '../../def/config';

export const config: TConfig = {
    server: {
        component: {
            authenticate: process.env.COMPONENT_AUTHENTICATE === 'true',
            id: Number(process.env.COMPONENT_ID!) as TGateId,
            socket: process.env.COMPONENT_SOCKET! as TSocketURL,
        },
        oauth: {
            clientId: process.env.OAUTH_CLIENT_ID!,
            login: process.env.OAUTH_LOGIN!,
            password: process.env.OAUTH_PASSWORD!,
            url: process.env.OAUTH_URL!,
        },
        service: {
            name: process.env.SERVICE_NAME!,
            nodeNo: Number(process.env.SERVICE_NODE_NO!),
            port: Number(process.env.SERVICE_PORT!),
            stage: process.env.SERVICE_STAGE!,
        },
    },
};
