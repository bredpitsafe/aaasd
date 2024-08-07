import type { Nil } from '@common/types';
import { EGrpcErrorCode, GrpcError } from '@frontend/common/src/types/GrpcError.ts';
import type { ErrorObject } from 'ajv';
import type { DefinedError } from 'ajv/dist/vocabularies/errors';
import { isArray, isString } from 'lodash-es';

export function createConvertError(message: string, description?: Nil | string | ErrorObject[]) {
    return new GrpcError(message, {
        code: EGrpcErrorCode.INVALID_ARGUMENT,
        description: isString(description)
            ? description
            : isArray(description)
              ? validateErrorsToString(description)
              : undefined,
    });
}

function filterValuableErrors(errors: ErrorObject[]): ErrorObject[] {
    return [...errors]
        .sort((err1, err2) => err2.instancePath.length - err1.instancePath.length)
        .reduce((acc: ErrorObject[], error) => {
            const hasPath = acc.find((err) => err.instancePath.startsWith(error.instancePath));

            if (!hasPath) {
                acc.push(error);
            }

            return acc;
        }, []);
}

function getFancyErrorMessage(error: ErrorObject): string | undefined {
    const keyword = error.keyword as DefinedError['keyword'];
    const { message, params } = error;
    switch (keyword) {
        case 'additionalProperties': {
            return message + `: (${params.additionalProperties})`;
        }
        case 'anyOf': {
            return `Path doesn't match required schema`;
        }
        case 'const': {
            return message + `: (${params.allowedValue})`;
        }
        case 'enum': {
            return message + `: (${params.allowedValues})`;
        }
    }

    return message;
}

function validateErrorsToString(errors: ErrorObject[]): string {
    return filterValuableErrors(errors)
        .map((error) => {
            return `${error.instancePath}: ${getFancyErrorMessage(error)}`;
        })
        .join('\n');
}
