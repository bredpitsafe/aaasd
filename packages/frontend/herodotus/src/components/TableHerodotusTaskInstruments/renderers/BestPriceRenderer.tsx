import { LoadingOutlined } from '@ant-design/icons';
import type { ICellRendererParams } from '@frontend/ag-grid';
import { UrlRenderer } from '@frontend/common/src/components/AgTable/renderers/UrlRenderer';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { ESide } from '@frontend/common/src/types/domain/task';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { getIndicatorsDashboardURL } from '@frontend/common/src/utils/urlBuilders';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useContext } from 'react';

import { BestPricesContext } from '../../../context/bestPricesContext';
import type { THerodotusTaskInstrumentView } from '../../../types';
import { cnBold, cnLink } from './BestPriceRenderer.css';

type TBestPriceRendererParams = {
    side?: THerodotusTaskInstrumentView['side'];
    socketName: TSocketName;
    onClick: (url: string, name: string) => void;
};

export const BestPriceRenderer = (
    params: ICellRendererParams<unknown, THerodotusTaskInstrumentView> & TBestPriceRendererParams,
): ReactElement | null => {
    const { socketName, onClick } = params;

    const bestPricesMap = useContext(BestPricesContext);
    if (isNil(params.data) || isNil(bestPricesMap)) {
        return <LoadingOutlined title="Loading prices..." />;
    }
    const side = params.side ?? params.data.side;
    const bestPrice = bestPricesMap.get(params.data.fullName);
    const className = cn(cnLink, { [cnBold]: !isNil(params.side) && params.data.side === side });
    const value = (side === ESide.Buy ? bestPrice?.bid : bestPrice?.ask) ?? '—';
    const name = (side === ESide.Buy ? bestPrice?.bidIndicator : bestPrice?.askIndicator) ?? '—';
    const url = getIndicatorsDashboardURL(name, socketName);
    const cbClick: TBestPriceRendererParams['onClick'] = useFunction((url) => onClick(url, name));

    return <UrlRenderer url={url} text={String(value)} className={className} onClick={cbClick} />;
};
