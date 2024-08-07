import type { TNotificationProps } from '@frontend/common/src/modules/notifications/def';
import { Mistake } from '@frontend/common/src/utils/Mistake';
import type { ErrorObject } from 'ajv';
import { isArray, isString } from 'lodash-es';
import type { ReactElement } from 'react';

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

function validateErrorsToElements(errors: ErrorObject[]): ReactElement[] {
    return errors.map(({ message, instancePath }, i) => {
        return (
            <div key={i}>
                {instancePath}: {message};
            </div>
        );
    });
}
