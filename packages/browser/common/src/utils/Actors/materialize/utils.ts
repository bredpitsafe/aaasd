import { isNil, isUndefined } from 'lodash-es';
import type { ErrorNotification } from 'rxjs';

import { IStructurallyCloneableErrorClass } from '../../../types/serialization';
import { hasToStructurallyCloneable } from '../../serialization';

export function trySerializeError(error: any): ErrorNotification['error'] {
    if (isNil(error)) return error;
    if (hasToStructurallyCloneable(error)) return error.toStructurallyCloneable();
    if (error instanceof Error) return error;
    return error;
}

export function tryDeserializeError(
    error: ErrorNotification['error'],
    ErrorClasses: IStructurallyCloneableErrorClass[],
): Error {
    const constructor = ErrorClasses.find((c) => c.isStructurallyCloneableError(error));
    return isUndefined(constructor) ? error : constructor.fromStructurallyCloneableError(error);
}
