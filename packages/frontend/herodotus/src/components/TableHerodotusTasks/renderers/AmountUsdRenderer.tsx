import { LoadingOutlined } from '@ant-design/icons';
import type { ICellRendererParams } from '@frontend/ag-grid';
import { formatUsd } from '@frontend/common/src/utils/formatNumber/formatNumber';
import { isNil } from 'lodash-es';
import type { ReactNode } from 'react';
import { useContext } from 'react';

import { ConvertRatesContext } from '../../../context/convertRatesContext';
import type { THerodotusTaskView } from '../../../types';

export const AmountUsdRenderer = (
    params: ICellRendererParams<unknown, THerodotusTaskView>,
): ReactNode | null => {
    const { convertRatesMap, loading } = useContext(ConvertRatesContext);
    if (loading) {
        return <LoadingOutlined title="Loading convert rates..." />;
    }
    if (isNil(params.data)) {
        return null;
    }

    const convertRateUsd = convertRatesMap?.get(params.data.asset)?.rate;
    if (isNil(convertRateUsd) || isNil(params.data.amountView)) {
        return '—';
    }
    return formatUsd(params.data.amountView * convertRateUsd);
};
