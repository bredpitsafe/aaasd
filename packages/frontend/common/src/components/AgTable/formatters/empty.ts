import type { ValueFormatterFunc } from '@frontend/ag-grid';
import { isNil, isString } from 'lodash-es';

export const emptyFormatter =
    (formatFn?: (value: any) => string): ValueFormatterFunc =>
    (params) => {
        if (isNil(params.data) && params.value === undefined) {
            return '';
        }
        let value = params.value;

        if (isString(params.value)) {
            const float = parseFloat(params.value);

            if (!isNaN(float) && isFinite(float)) {
                value = float;
            } else {
                return params.value || '—';
            }
        }

        return formatFn?.(value) ?? value;
    };
