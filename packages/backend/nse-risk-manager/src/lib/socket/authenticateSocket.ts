import type { BFFSocket } from '@frontend/common/src/lib/BFFSocket/BFFSocket';
import { createSocketStream } from '@frontend/common/src/lib/SocketStream';
import type { TSocketStreamOptions } from '@frontend/common/src/lib/SocketStream/def';
import { createEnvelope } from '@frontend/common/src/modules/communicationHandlers/utils';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import type { Observable } from 'rxjs';
import { first, from, map, of, switchMap } from 'rxjs';
import { filter } from 'rxjs/operators';

import { config } from '../config';
import { getToken } from '../keycloak';

type TAuthSendBody = {
    type: 'Authenticate';
    bearerToken: string;
};

type TAuthReceiveBody = {
    type: 'Authenticated' | 'AuthenticationNotRequired';
};

export const authenticateSocket =
    (socket: BFFSocket, options: TSocketStreamOptions) => (): Observable<void> => {
        if (!config.server.component.authenticate) {
            return of(undefined);
        }

        return from(getToken()).pipe(
            switchMap((bearerToken) => {
                const envelope = createEnvelope<TAuthSendBody>(
                    { type: 'Authenticate', bearerToken },
                    options.traceId,
                );
                // @ts-ignore
                return createSocketStream<TAuthSendBody, TAuthReceiveBody>(
                    socket,
                    envelope,
                    undefined,
                    options,
                );
            }),
            filter(isSyncedValueDescriptor),
            map((v) => v.value),
            first(),
            map(() => undefined),
        );
    };
