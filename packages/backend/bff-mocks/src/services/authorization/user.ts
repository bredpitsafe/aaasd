import { faker } from '@faker-js/faker';
import type { UserServiceServer } from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';

import { EActorName } from '../../def/actor.ts';
import { wrapWritableStream } from '../../utils/wrapWritableStream.ts';
import { randomUser } from './generators/randomUser.ts';
export { UserServiceService } from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';

const TOTAL_ITEMS = 1000;
const USERS = faker.helpers.multiple(randomUser, {
    count: TOTAL_ITEMS,
});
export const userService: UserServiceServer = {
    subscribeToUserSnapshot: (stream) => {
        const call = wrapWritableStream(
            EActorName.AuthorizationService,
            userService.subscribeToUserSnapshot.name,
            stream,
        );

        call.write({
            response: { type: 'ok', ok: { platformTime: undefined } },
        });

        call.write({
            response: { type: 'snapshot', snapshot: { entities: USERS } },
        });
        call.end();
    },
};
