import { faker } from '@faker-js/faker';
import type {
    TArgument,
    TParam,
    TPolicyPermission,
    TPolicyTemplate,
} from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';

let prevId = 0;
export const randomPolicyTemplate = (): TPolicyTemplate => {
    return {
        name: faker.lorem.slug({ min: 1, max: 4 }),
        description: faker.lorem.sentence({ min: 1, max: 30 }),
        parameters: faker.helpers.multiple(randomPolicyParameter, { count: { min: 1, max: 30 } }),
        permissions: faker.helpers.multiple(randomPolicyPermission, { count: { min: 1, max: 30 } }),
    };
};

const randomPolicyParameter = (): TParam => {
    return {
        name: faker.lorem.slug({ min: 1, max: 4 }),
        description: faker.lorem.sentence({ min: 1, max: 30 }),
    };
};

const randomPolicyArgument = (): TArgument => {
    return {
        name: faker.lorem.slug({ min: 1, max: 4 }),
        value: faker.lorem.sentence({ min: 1, max: 5 }),
    };
};

const randomPolicyPermission = (): TPolicyPermission => {
    return {
        id: prevId++,
        name: faker.lorem.slug({ min: 1, max: 4 }),
        description: faker.lorem.sentence({ min: 1, max: 30 }),
        arguments: faker.helpers.multiple(randomPolicyArgument, { count: { min: 1, max: 10 } }),
    };
};
