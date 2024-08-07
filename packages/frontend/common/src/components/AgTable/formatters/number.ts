import type { ValueFormatterFunc } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';

import { formatNumber } from '../../../utils/formatNumber/formatNumber';
import { sprintf } from '../../../utils/sprintf/sprintf';
import { emptyFormatter } from './empty';

const DEFAULT_FORMAT = '%.1f';

export const numberFormatter = (format: string = DEFAULT_FORMAT): ValueFormatterFunc =>
    emptyFormatter((value) => (!isNil(value) && !isNaN(value) ? sprintf(format, value) : '—'));

export const maxPrecisionNumberFormatter = (): ValueFormatterFunc => (value) =>
    formatNumber(value.value, { maximumFractionDigits: 20 });
