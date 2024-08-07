import { faker } from '@faker-js/faker';
import type { PolicyTemplateServiceServer } from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';

import { EActorName } from '../../def/actor.ts';
import { wrapUnaryCall } from '../../utils/wrapUnaryCall.ts';
import { randomPolicyTemplate } from './generators/randomPolicyTemplate.ts';

export { PolicyTemplateServiceService } from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';

const TOTAL_ITEMS = 100;
const POLICY_TEMPLATES = faker.helpers.multiple(randomPolicyTemplate, {
    count: TOTAL_ITEMS,
});

export const policyTemplateService: PolicyTemplateServiceServer = {
    fetchPolicyTemplateSnapshot: function (call, cb): void {
        const callback = wrapUnaryCall(
            EActorName.AuthorizationService,
            policyTemplateService.fetchPolicyTemplateSnapshot.name,
            call,
            cb,
        );
        callback(null, { entities: POLICY_TEMPLATES });
    },
};
