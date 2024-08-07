import type { GrpcResponseStatus } from './index.ts';

export type TGrpcError = {
    code: GrpcResponseStatus;
    details: string;
};
