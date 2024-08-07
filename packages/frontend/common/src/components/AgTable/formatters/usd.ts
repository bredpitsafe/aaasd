import type { ValueFormatterFunc } from '@frontend/ag-grid';

import { formatUsd, formatUsdCompact } from '../../../utils/formatNumber/formatNumber';
import { emptyFormatter } from './empty';

export const usdFormatter = (compact = false): ValueFormatterFunc =>
    emptyFormatter((value) => (compact ? formatUsdCompact(value) : formatUsd(value)));
