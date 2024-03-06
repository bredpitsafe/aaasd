import { LoadingOutlined } from '@ant-design/icons';
import { formatUsd } from '@frontend/common/src/utils/formatNumber/formatNumber';
import { ICellRendererParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { ReactNode, useContext } from 'react';

import { ConvertRatesContext } from '../../../context/convertRatesContext';
import { THerodotusTaskView } from '../../../types';

export const AmountUsdRenderer = (
    params: ICellRendererParams<THerodotusTaskView>,
): ReactNode | null => {
    const convertRatesMap = useContext(ConvertRatesContext);
    if (isNil(params.data) || isNil(convertRatesMap)) {
        return <LoadingOutlined title="Loading convert rates..." />;
    }
    const convertRateUsd = convertRatesMap.get(params.data.asset)?.rate;
    if (isNil(convertRateUsd) || isNil(params.data.amountView)) {
        return '—';
    }
    return formatUsd(params.data.amountView * convertRateUsd);
};
