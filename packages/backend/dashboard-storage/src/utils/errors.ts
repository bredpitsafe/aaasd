import { GrpcResponseStatus } from '@backend/grpc/src/types/index.ts';
import {
    convertToGrpcError as generalConvertToGrpcError,
    GrpcError,
} from '@backend/grpc/src/utils/error.ts';

interface IActorError {
    kind: EActorErrorKind;
    title: string;
    description?: string;
    args?: Record<string, unknown>;
}

export enum EActorErrorKind {
    Validation = 'Validation',
    Authentication = 'Authentication',
    Authorization = 'Authorization',
    InternalError = 'InternalError',
    Timeout = 'Timeout',
    NotFound = 'NotFound',
    Unspecified = 'Unspecified',
    Database = 'Database',
}

const actorErrorKindToGrpcErrorCodeMapping: Record<EActorErrorKind, GrpcResponseStatus> = {
    [EActorErrorKind.Validation]: GrpcResponseStatus.INVALID_ARGUMENT,
    [EActorErrorKind.Authentication]: GrpcResponseStatus.UNAUTHENTICATED,
    [EActorErrorKind.Authorization]: GrpcResponseStatus.PERMISSION_DENIED,
    [EActorErrorKind.InternalError]: GrpcResponseStatus.INTERNAL,
    [EActorErrorKind.Timeout]: GrpcResponseStatus.DEADLINE_EXCEEDED,
    [EActorErrorKind.NotFound]: GrpcResponseStatus.NOT_FOUND,
    [EActorErrorKind.Unspecified]: GrpcResponseStatus.UNKNOWN,
    [EActorErrorKind.Database]: GrpcResponseStatus.INTERNAL,
};

export class ActorError extends Error implements IActorError {
    static readonly type = 'ActorError';
    public kind: EActorErrorKind;
    public title: string;
    public description: string;
    public args?: Record<string, unknown>;

    constructor(params: IActorError) {
        super(params.title);
        this.kind = params.kind;
        this.title = params.title;
        this.description = `${this.title}${params.description ? `: ${params.description}` : ''}`;
        this.args = params.args;
    }
}

const isActorError = (error: unknown): error is ActorError => error instanceof ActorError;

const convertActorErrorIntoGrpcError = (actorError: ActorError): GrpcError => {
    return new GrpcError({
        code: actorErrorKindToGrpcErrorCodeMapping[actorError.kind],
        details: actorError.description,
    });
};

export const convertToGrpcError = (error: unknown): GrpcError =>
    isActorError(error) ? convertActorErrorIntoGrpcError(error) : generalConvertToGrpcError(error);
