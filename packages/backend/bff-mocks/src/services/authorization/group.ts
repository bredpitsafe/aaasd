import { faker } from '@faker-js/faker';
import type { GroupServiceServer } from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';

import { EActorName } from '../../def/actor.ts';
import { wrapWritableStream } from '../../utils/wrapWritableStream.ts';
import { randomGroup } from './generators/randomGroup.ts';

export { GroupServiceService } from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';

const TOTAL_ITEMS = 100;
const GROUPS = faker.helpers.multiple(randomGroup, {
    count: TOTAL_ITEMS,
});

export const groupService: GroupServiceServer = {
    subscribeToGroupSnapshot: (stream) => {
        const call = wrapWritableStream(
            EActorName.AuthorizationService,
            groupService.subscribeToGroupSnapshot.name,
            stream,
        );

        call.write({
            response: { type: 'ok', ok: { platformTime: undefined } },
        });

        call.write({
            response: { type: 'snapshot', snapshot: { entities: GROUPS } },
        });

        call.end();
    },
};
