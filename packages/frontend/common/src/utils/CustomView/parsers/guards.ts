import { isNil, isString } from 'lodash-es';

import type { TFormattedText } from './defs';

export function isFormattedText(value?: string | TFormattedText): value is TFormattedText {
    return !isNil(value) && !isString(value);
}
