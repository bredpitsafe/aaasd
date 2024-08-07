import { assertFail } from '@common/utils';
import type { TKind } from '@grpc-schemas/dashboard_storage-api-sdk/index.services.dashboard_storage.v1';

import { Kind } from '../../def/response.ts';

export const toGrcpKind = (kind: Kind): TKind => {
    switch (kind) {
        case Kind.User:
            return 'KIND_USER';
        case Kind.Robot:
            return 'KIND_ROBOT';
    }
};

export const fromGrpcKind = (grpcKind: TKind): Kind => {
    switch (grpcKind) {
        case 'KIND_USER':
            return Kind.User;
        case 'KIND_ROBOT':
            return Kind.Robot;
        case 'KIND_UNSPECIFIED':
            assertFail(grpcKind);
    }
};
