import { ErrorResponse } from '../def/response.ts';

type TActorErrorConstructorParams = {
    kind: EActorErrorKind;
    title: string;
    description?: string;
    args?: Record<string, unknown>;
};

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

export class ActorError extends Error {
    static readonly type = 'ActorError';
    private readonly params: TActorErrorConstructorParams;
    constructor(params: TActorErrorConstructorParams) {
        super(params.title);
        this.params = params;
    }

    toErrorResponse(): ErrorResponse {
        return {
            kind: this.params.kind,
            description: `${this.message}${
                this.params.description ? `: ${this.params.description}` : ''
            }`,
            args: this.params.args,
        };
    }
}
