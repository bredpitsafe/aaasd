import { isNil, isString } from 'lodash-es';

export { InputNumber } from 'antd';
import { InputNumberProps } from 'antd/lib/input-number';

import { formatNumber } from '../utils/formatNumber/formatNumber';
import { getFractionDigitsCount } from '../utils/math';
export type { InputNumberProps } from 'antd/lib/input-number';

export const DEFAULT_NUMBER_FORMATTER: InputNumberProps['formatter'] = (value) => {
    if (isNil(value) || value === '') {
        return '';
    }

    const fractionLength = getFractionDigitsCount(isString(value) ? parseFloat(value) : value);
    const minimumFractionDigits = Number.isNaN(fractionLength) ? 0 : fractionLength;
    return formatNumber(Number(value), {
        maximumFractionDigits: 20,
        minimumFractionDigits,
    });
};
