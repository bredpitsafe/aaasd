import type {
    TKind,
    TStatus,
} from '@grpc-schemas/dashboard_storage-api-sdk/index.services.dashboard_storage.v1';

import type { Kind, Status } from './response';

export type TDbDashboard = {
    id: string;
    legacyId?: number;
    name: string;
    kind: Kind;
    status: Status;
    config: string;
    digest: string;
    // This is update time actually
    insertionTime: string;
};

export type TGrpcDashboard = Omit<TDbDashboard, 'kind' | 'status'> & {
    kind: TKind;
    status: TStatus;
};
