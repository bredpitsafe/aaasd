import { LoadingOutlined } from '@ant-design/icons';
import { UrlRenderer } from '@frontend/common/src/components/AgTable/renderers/UrlRenderer';
import { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { getIndicatorsDashboardURL } from '@frontend/common/src/utils/urlBuilders';
import { ICellRendererParams } from 'ag-grid-community';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { ReactElement, useContext } from 'react';

import { BestPricesContext } from '../../../context/bestPricesContext';
import { THerodotusTaskInstrumentView } from '../../../types';
import { EHerodotusTaskType } from '../../../types/domain';
import { cnBold, cnLink } from './BestPriceRenderer.css';

type TBestPriceRendererParams = {
    side?: THerodotusTaskInstrumentView['side'];
    socketName: TSocketName;
    onClick: (url: string, name: string) => void;
};
export const BestPriceRenderer = (
    params: ICellRendererParams<THerodotusTaskInstrumentView> & TBestPriceRendererParams,
): ReactElement | null => {
    const { socketName, onClick } = params;

    const bestPricesMap = useContext(BestPricesContext);
    if (isNil(params.data) || isNil(bestPricesMap)) {
        return <LoadingOutlined title="Loading prices..." />;
    }
    const side = params.side ?? params.data.side;
    const bestPrice = bestPricesMap.get(params.data.fullName);
    const className = cn(cnLink, { [cnBold]: !isNil(params.side) && params.data.side === side });
    const value = (side === EHerodotusTaskType.Buy ? bestPrice?.bid : bestPrice?.ask) ?? '—';
    const name =
        (side === EHerodotusTaskType.Buy ? bestPrice?.bidIndicator : bestPrice?.askIndicator) ??
        '—';
    const url = getIndicatorsDashboardURL(name, socketName);
    const cbClick: TBestPriceRendererParams['onClick'] = useFunction((url) => onClick(url, name));

    return <UrlRenderer url={url} text={String(value)} className={className} onClick={cbClick} />;
};
