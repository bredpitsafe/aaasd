import { LoadingOutlined } from '@ant-design/icons';
import { createTestProps } from '@frontend/common/e2e';
import { EDashboardsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/dashboards-tab/dashboards.tab.selectors';
import { UrlRenderer } from '@frontend/common/src/components/AgTable/renderers/UrlRenderer';
import { ICellRendererParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { ReactElement, useContext } from 'react';

import { InstrumentsLinksContext } from '../../../context/instrumentsLinksContext';
import { THerodotusTaskInstrumentView } from '../../../types';
import { isV2HeroProtocolInstrument } from '../../../utils/isV2HeroProtocol';
import { cnSpace } from './InstrumentNameRenderer.css';

export const InstrumentNameRenderer = (
    params: ICellRendererParams<THerodotusTaskInstrumentView>,
): ReactElement | null => {
    const instrumentsLinks = useContext(InstrumentsLinksContext);
    if (isNil(params.data)) {
        return null;
    }
    const linkKey = isV2HeroProtocolInstrument(params.data)
        ? params.data.instrument
        : `${params.data.name}|${params.data.exchange}`;
    const url = instrumentsLinks?.get(linkKey);

    return (
        <div className={cnSpace}>
            <UrlRenderer
                {...createTestProps(EDashboardsTabSelectors.DashboardLink)}
                url={url}
                text={params.value}
            />
            {isNil(instrumentsLinks) && (
                <div>
                    <LoadingOutlined title="Loading instrument links..." />
                </div>
            )}
        </div>
    );
};
