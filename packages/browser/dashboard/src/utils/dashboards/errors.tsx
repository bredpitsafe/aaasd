import type { TNotificationProps } from '@frontend/common/src/modules/notifications/def';
import { Mistake } from '@frontend/common/src/utils/Mistake';
import type { ErrorObject } from 'ajv';
import type { DefinedError } from 'ajv/dist/vocabularies/errors';
import { isArray, isString } from 'lodash-es';
import { ReactElement } from 'react';

export class ConvertError extends Mistake {
    constructor(
        message: string,
        private description?: null | undefined | string | ErrorObject[],
    ) {
        super(message);
    }

    toNotification(): TNotificationProps {
        return {
            message: this.message,
            description: isString(this.description)
                ? this.description
                : isArray(this.description)
                  ? validateErrorsToElements(this.description)
                  : undefined,
        };
    }
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

function validateErrorsToElements(errors: ErrorObject[]): ReactElement[] {
    return filterValuableErrors(errors).map((error, i) => {
        return (
            <div key={i}>
                {error.instancePath}: {getFancyErrorMessage(error)};
            </div>
        );
    });
}
