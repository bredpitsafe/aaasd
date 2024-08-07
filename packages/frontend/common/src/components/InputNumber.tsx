import { getFractionDigitsCount } from '@common/utils';
import type { InputNumberProps } from 'antd/lib/input-number';
import { isNil, isString } from 'lodash-es';

export { InputNumber } from 'antd';
export type { InputNumberProps } from 'antd/lib/input-number';

import { formatNumber } from '../utils/formatNumber/formatNumber';

const MAX_FRACTION_DIGITS = 20;

export const DEFAULT_NUMBER_FORMATTER: InputNumberProps['formatter'] = (value) => {
    if (isNil(value) || value === '') {
        return '';
    }

    const fractionLength = getFractionDigitsCount(isString(value) ? parseFloat(value) : value);
    const minimumFractionDigits = Number.isNaN(fractionLength) ? 0 : fractionLength;

    return formatNumber(Number(value), {
        maximumFractionDigits: MAX_FRACTION_DIGITS,
        minimumFractionDigits: Math.min(minimumFractionDigits, MAX_FRACTION_DIGITS),
    });
};
