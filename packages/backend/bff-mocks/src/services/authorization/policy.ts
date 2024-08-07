import { faker } from '@faker-js/faker';
import type { PolicyServiceServer } from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';

import { EActorName } from '../../def/actor.ts';
import { wrapUnaryCall } from '../../utils/wrapUnaryCall.ts';
import { wrapWritableStream } from '../../utils/wrapWritableStream.ts';
import { randomPolicy } from './generators/randomPolicy.ts';

export { PolicyServiceService } from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';

const TOTAL_ITEMS = 1000;
const POLICIES = faker.helpers.multiple(randomPolicy, {
    count: TOTAL_ITEMS,
});

export const policyService: PolicyServiceServer = {
    subscribeToPolicySnapshot: (stream) => {
        const call = wrapWritableStream(
            EActorName.AuthorizationService,
            policyService.subscribeToPolicySnapshot.name,
            stream,
        );

        call.write({
            response: { type: 'ok', ok: { platformTime: undefined } },
        });

        call.write({
            response: { type: 'snapshot', snapshot: { entities: POLICIES } },
        });

        call.end();
    },
    removePolicy: function (call, cb): void {
        const callback = wrapUnaryCall(
            EActorName.AuthorizationService,
            policyService.removePolicy.name,
            call,
            cb,
        );
        callback(null, {});
    },
    renderPolicy: function (call, cb): void {
        const callback = wrapUnaryCall(
            EActorName.AuthorizationService,
            policyService.renderPolicy.name,
            call,
            cb,
        );
        callback(null, { permissions: [] });
    },
    grantPolicy: function (call, cb): void {
        const callback = wrapUnaryCall(
            EActorName.AuthorizationService,
            policyService.grantPolicy.name,
            call,
            cb,
        );
        callback(null, {});
    },
    revokePolicy: function (call, cb): void {
        const callback = wrapUnaryCall(
            EActorName.AuthorizationService,
            policyService.revokePolicy.name,
            call,
            cb,
        );
        callback(null, {});
    },
    upsertPolicy: function (call, cb): void {
        const callback = wrapUnaryCall(
            EActorName.AuthorizationService,
            policyService.upsertPolicy.name,
            call,
            cb,
        );

        callback(null, {
            result: {
                id: faker.number.int(),
                ...call.request.entity,
            },
        });
    },
};
