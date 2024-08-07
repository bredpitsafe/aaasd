import type { TraceId } from '@common/utils';
import type { ReactNode } from 'react';

import { GrpcError } from '../types/GrpcError';
import type { TGrpcFail } from './ValueDescriptor/types';

export type TInfo = {
    message: string;
    description?: string | ReactNode;
    traceId?: TraceId;
};

export const fromErrorToInfo = (error: Error | GrpcError): TInfo => ({
    message: error.message,
    description: error instanceof GrpcError ? error.description : undefined,
    traceId: error instanceof GrpcError ? error.traceId : undefined,
});

export const fromFailToInfo = (fail: TGrpcFail): TInfo => fail.meta;

export function createHandleError(
    callback: (info: TInfo) => void,
    map: typeof fromErrorToInfo = fromErrorToInfo,
) {
    return (err: Error | GrpcError) => {
        const def = fromErrorToInfo(err);
        const info = map(err);

        callback({
            message: info.message,
            description: info?.description ?? def.description,
            traceId: info.traceId ?? def.traceId,
        });
    };
}

export function createHandleFail(
    callback: (info: TInfo) => void,
    map: typeof fromFailToInfo = fromFailToInfo,
) {
    return (fail: TGrpcFail) => {
        const def = fromFailToInfo(fail);
        const info = map(fail);

        callback({
            message: info.message,
            description: info?.description ?? def.description,
            traceId: info.traceId ?? def.traceId,
        });
    };
}
