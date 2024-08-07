import { faker } from '@faker-js/faker';
import type { TGroup } from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';

import { randomUserName } from './randomUser.ts';

export const randomGroup = (): TGroup => {
    return {
        name: randomGroupName(),
        description: faker.lorem.sentence({ min: 1, max: 30 }),
        groupMembers: faker.helpers.multiple(randomGroupName, { count: { min: 0, max: 20 } }),
        policies: faker.helpers.multiple(faker.number.int, { count: { min: 0, max: 20 } }),
        userMembers: faker.helpers.multiple(randomUserName, { count: { min: 0, max: 20 } }),
    };
};

export const randomGroupName = (): string => {
    return faker.lorem.slug({ min: 1, max: 4 });
};
