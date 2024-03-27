import { Kind, Status } from './response.ts';

export type TDashboard = {
    id: string;
    legacyId?: number;
    name: string;
    kind: Kind;
    status: Status;
    config: string;
    digest: string;
    insertionTime: string;
};
