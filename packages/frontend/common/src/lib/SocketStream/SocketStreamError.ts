import type { Milliseconds, Nil } from '@common/types';
import { getNowMilliseconds } from '@common/utils';
import { isEmpty, isString } from 'lodash-es';

import type { TSocketURL } from '../../types/domain/sockets.ts';
import { GrpcError } from '../../types/GrpcError';
import type { TStructurallyCloneableObject } from '../../types/serialization';
import type { EErrorReason } from './def';

type TSocketStreamErrorProps = ConstructorParameters<typeof GrpcError>[1] & {
    reason: EErrorReason;
    correlationId?: number;
    kind?: string;
    args?: TStructurallyCloneableObject;
    timestamp?: Milliseconds;
    socketURL: TSocketURL;
};

export class SocketStreamError extends GrpcError {
    protected static prefix = 'SocketStreamError';

    public readonly reason: EErrorReason;
    public readonly timestamp: Milliseconds;
    public readonly kind?: string;
    public readonly args?: TStructurallyCloneableObject;
    public readonly correlationId?: number;
    public readonly socketURL: TSocketURL;

    constructor(
        public readonly message: string,
        props: TSocketStreamErrorProps,
    ) {
        super(message, { ...props, description: props.description ?? getDescription(props.args) });

        this.reason = props.reason;
        this.kind = props.kind;
        this.args = props.args;
        this.correlationId = props.correlationId;
        this.timestamp = props.timestamp ?? getNowMilliseconds();
        this.socketURL = props.socketURL;
    }

    public toJSON(): object {
        return {
            ...super.toJSON(),

            reason: this.reason,
            kind: this.kind,
            args: this.args,

            correlationId: this.correlationId,
            timestamp: this.timestamp,

            socketURL: this.socketURL,
        };
    }
}

function getDescription(args: Nil | TStructurallyCloneableObject): undefined | string {
    if (isEmpty(args)) return;
    return isWithDetails(args) ? args.details : JSON.stringify(args);
}

type TArgumentsWithDetails = { details: string };

function isWithDetails(value: unknown): value is TArgumentsWithDetails {
    return (
        !isEmpty(value) &&
        'details' in (value as TArgumentsWithDetails) &&
        isString((value as TArgumentsWithDetails).details)
    );
}
