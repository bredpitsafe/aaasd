import { isEmpty, isString } from 'lodash-es';

import { GrpcError } from '../../types/GrpcError';
import { TStructurallyCloneableObject } from '../../types/serialization';
import type { EErrorReason } from './def';

type TSocketStreamErrorProps = ConstructorParameters<typeof GrpcError>[1] & {
    reason: EErrorReason;
    correlationId?: number;
    kind?: string;
    args?: TStructurallyCloneableObject;
    timestamp?: number;
};

export class SocketStreamError extends GrpcError {
    protected static prefix = 'SocketStreamError';

    public readonly reason: EErrorReason;
    public readonly timestamp: number;
    public readonly kind?: string;
    public readonly args?: TStructurallyCloneableObject;
    public readonly correlationId?: number;

    constructor(
        public readonly message: string,
        props: TSocketStreamErrorProps,
    ) {
        super(message, props);

        this.reason = props.reason;
        this.kind = props.kind;
        this.args = props.args;
        this.correlationId = props.correlationId;
        this.timestamp = props.timestamp ?? Date.now();
    }

    public getDescription(): undefined | string {
        if (isEmpty(this.args)) {
            return;
        }

        // @ts-ignore
        return isWithDetails(this.args) ? this.args.details : JSON.stringify(this.args);
    }

    public toJSON(): object {
        return {
            ...super.toJSON(),

            reason: this.reason,
            kind: this.kind,
            args: this.args,

            correlationId: this.correlationId,
            timestamp: this.timestamp,
        };
    }
}

type TArgumentsWithDetails = { details: string };

function isWithDetails(value: unknown): value is TArgumentsWithDetails {
    return (
        !isEmpty(value) &&
        'details' in (value as TArgumentsWithDetails) &&
        isString((value as TArgumentsWithDetails).details)
    );
}
