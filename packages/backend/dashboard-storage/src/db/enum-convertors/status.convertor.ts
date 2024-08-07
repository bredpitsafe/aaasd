import { assertFail } from '@common/utils';
import type { TStatus } from '@grpc-schemas/dashboard_storage-api-sdk/index.services.dashboard_storage.v1';

import { Status } from '../../def/response.ts';

export const toGrcpStatus = (status: Status): TStatus => {
    switch (status) {
        case Status.Active:
            return 'STATUS_ACTIVE';
        case Status.Archived:
            return 'STATUS_ARCHIVED';
        case Status.Suspended:
            return 'STATUS_SUSPENDED';
    }
};

export const fromGrpcStatus = (grpcStatus: TStatus): Status => {
    switch (grpcStatus) {
        case 'STATUS_ACTIVE':
            return Status.Active;
        case 'STATUS_ARCHIVED':
            return Status.Archived;
        case 'STATUS_SUSPENDED':
            return Status.Suspended;
        case 'STATUS_UNSPECIFIED':
            assertFail(grpcStatus);
    }
};
