import { LoadingOutlined } from '@ant-design/icons';
import type { ColDef, ICellRendererParams, ValueGetterParams } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { createTestProps } from '@frontend/common/e2e';
import { EDashboardsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/dashboards-tab/dashboards.tab.selectors';
import { UrlRenderer } from '@frontend/common/src/components/AgTable/renderers/UrlRenderer';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useContext } from 'react';

import { InstrumentsLinksContext } from '../../../../context/instrumentsLinksContext';
import type { THerodotusTaskInstrumentView } from '../../../../types';
import { isV2HeroProtocolInstrument } from '../../../../utils/isV2HeroProtocol';
import { cnSpace } from './InstrumentNameRenderer.css';

export function getInstrumentNameColumn(): ColDef<THerodotusTaskInstrumentView> {
    return {
        headerName: 'Name',
        valueGetter,
        cellRenderer,
    };
}

const valueGetter = ({ data }: ValueGetterParams<THerodotusTaskInstrumentView>) => {
    return (
        data &&
        AgValue.create(data.fullName, {
            name: data.name,
            exchange: data.exchange,
            instrument: isV2HeroProtocolInstrument(data) ? data.instrument : undefined,
        })
    );
};

const cellRenderer = (
    params: ICellRendererParams<ReturnType<typeof valueGetter>>,
): ReactElement | null => {
    const instrumentsLinks = useContext(InstrumentsLinksContext);

    if (isNil(params.value)) {
        return null;
    }

    const value = params.value.payload;
    const data = params.value.data;
    const linkKey = data.instrument ?? `${data.name}|${data.exchange}`;
    const url = instrumentsLinks?.get(linkKey);

    return (
        <div className={cnSpace}>
            <UrlRenderer
                {...createTestProps(EDashboardsTabSelectors.DashboardLink)}
                url={url}
                text={value}
            />
            {isNil(instrumentsLinks) && (
                <div>
                    <LoadingOutlined title="Loading instrument links..." />
                </div>
            )}
        </div>
    );
};
