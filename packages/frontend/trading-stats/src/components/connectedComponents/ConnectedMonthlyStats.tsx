import { Title } from '@frontend/common/src/components/Title';
import { ReactElement } from 'react';

import { cnFullHeightTab, cnTableTitle } from '../../layouts/index.css';
import { ConnectedARBFeesTable } from './ConnectedARBFeesTable';
import { ConnectedARBMakerTable } from './ConnectedARBMakerTable';
import { ConnectedARBTakerTable } from './ConnectedARBTakerTable';
import { ConnectedARBVolumeTable } from './ConnectedARBVolumeTable';
import { ConnectedProfitsTable } from './ConnectedProfitsTable';

export function ConnectedMonthlyStats(): ReactElement {
    return (
        <div className={cnFullHeightTab}>
            <div>
                <Title level={5} className={cnTableTitle}>
                    Profits
                </Title>
                <ConnectedProfitsTable />
            </div>
            <div>
                <Title level={5} className={cnTableTitle}>
                    ARB Volume Stats
                </Title>
                <ConnectedARBVolumeTable />
            </div>
            <div>
                <Title level={5} className={cnTableTitle}>
                    ARB Maker Volume Stats
                </Title>
                <ConnectedARBMakerTable />
            </div>
            <div>
                <Title level={5} className={cnTableTitle}>
                    ARB Taker Volume Stats
                </Title>
                <ConnectedARBTakerTable />
            </div>
            <div>
                <Title level={5} className={cnTableTitle}>
                    ARB Fees Stats
                </Title>
                <ConnectedARBFeesTable />
            </div>
        </div>
    );
}
