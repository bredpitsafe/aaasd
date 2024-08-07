import type { EGrpcStatus, TGrpcError, TMetadata } from './def.ts';

export class GrpcClientError extends Error {
    static fromGrpcError(err: TGrpcError): GrpcClientError {
        return new GrpcClientError(err.details || err.message, err.code, err.metadata);
    }

    code: EGrpcStatus;
    metadata: TMetadata;

    constructor(details: string, code: EGrpcStatus, metadata: TMetadata) {
        super(details);
        this.code = code;
        this.metadata = metadata;
    }
}
