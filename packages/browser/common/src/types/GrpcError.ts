import { TraceId } from '../utils/traceId';
import { StructurallyCloneableError } from './StructurallyCloneableError';

export enum EGrpcErrorCode {
    CANCELLED = 'CANCELLED',
    UNKNOWN = 'UNKNOWN',
    INVALID_ARGUMENT = 'INVALID_ARGUMENT',
    DEADLINE_EXCEEDED = 'DEADLINE_EXCEEDED',
    NOT_FOUND = 'NOT_FOUND',
    ALREADY_EXISTS = 'ALREADY_EXISTS',
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',
    FAILED_PRECONDITION = 'FAILED_PRECONDITION',
    ABORTED = 'ABORTED',
    OUT_OF_RANGE = 'OUT_OF_RANGE',
    UNIMPLEMENTED = 'UNIMPLEMENTED',
    INTERNAL = 'INTERNAL',
    UNAVAILABLE = 'UNAVAILABLE',
    DATA_LOSS = 'DATA_LOSS',
    UNAUTHENTICATED = 'UNAUTHENTICATED',
}

export class GrpcError extends StructurallyCloneableError {
    protected static prefix = 'GrpcError';

    public readonly code: EGrpcErrorCode;
    public readonly description?: string;
    public readonly traceId?: TraceId;

    constructor(
        public readonly message: string,
        props: {
            code: EGrpcErrorCode;
            traceId?: TraceId;
            description?: string;
            cause?: undefined | Error;
        },
    ) {
        super(message, props);
        this.code = props.code;
        this.description = props.description;
        this.traceId = props.traceId;
    }

    public toJSON(): object {
        return {
            ...super.toJSON(),
            code: this.code,
            description: this.description,
            traceId: this.traceId,
        };
    }
}

export function convertErrToGrpcError(err: Error | GrpcError): GrpcError {
    return new GrpcError(err.message, {
        code: err instanceof GrpcError ? err.code : EGrpcErrorCode.UNKNOWN,
        description: 'description' in err ? err.description : undefined,
        traceId: 'traceId' in err ? err.traceId : undefined,
    });
}
