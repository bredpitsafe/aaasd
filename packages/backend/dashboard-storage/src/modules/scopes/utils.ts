import { GrpcResponseStatus } from '@backend/grpc/src/types/index.ts';
import { GrpcError } from '@backend/grpc/src/utils/error.ts';
import { isFlatObject } from '@common/utils';
import { isObject } from 'lodash-es';

const isScopeObject = (scope: unknown): boolean => {
    return isObject(scope) && isFlatObject(scope);
};

export const validateScopeObject = (scope: unknown) => {
    if (!isScopeObject(scope)) {
        throw new GrpcError({
            code: GrpcResponseStatus.INVALID_ARGUMENT,
            details:
                'Scope param must be a flat object with one level of primitive type properties',
        });
    }
};
