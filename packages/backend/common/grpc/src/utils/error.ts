import { extractErrorMessage as generalExtractErrorMessage } from '@backend/utils/src/general.ts';
import type { Metadata } from '@grpc/grpc-js';

import { GrpcResponseStatus } from '../types/index.ts';

export const isGrpcError = (error: unknown): error is GrpcError => error instanceof GrpcError;

export const extractErrorMessage = (error: unknown) => {
    return (isGrpcError(error) ? error.details : generalExtractErrorMessage(error)) ?? '';
};

export class GrpcError {
    public code: GrpcResponseStatus;
    public details: string;
    public metadata?: Metadata;

    constructor(params: Omit<GrpcError, 'getFilteredGrpcError'>) {
        this.code = params.code;
        this.details = params.details;
        this.metadata = params.metadata;
    }

    public getFilteredGrpcError(): GrpcError {
        if (this.code === GrpcResponseStatus.INTERNAL) {
            return new GrpcError({
                code: this.code,
                details: 'Internal server error',
            });
        }

        return this;
    }
}

export const convertToGrpcError = (error: unknown): GrpcError =>
    isGrpcError(error)
        ? error
        : new GrpcError({
              code: GrpcResponseStatus.INTERNAL,
              details: extractErrorMessage(error),
          });
