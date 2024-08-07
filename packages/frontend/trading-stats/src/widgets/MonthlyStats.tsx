import { Title } from '@frontend/common/src/components/Title.tsx';
import type { ReactElement } from 'react';

import { cnFullHeightTab, cnTableTitle } from '../layouts/index.css.ts';
import { WidgetARBFeesTable } from './ARBFeesTable.tsx';
import { WidgetARBMakerTable } from './ARBMakerTable.tsx';
import { WidgetARBTakerTable } from './ARBTakerTable.tsx';
import { WidgetARBVolumeTable } from './ARBVolumeTable.tsx';
import { WidgetProfitsTable } from './ProfitsTable.tsx';

export function WidgetMonthlyStats(): ReactElement {
    return (
        <div className={cnFullHeightTab}>
            <div>
                <Title level={5} className={cnTableTitle}>
                    Profits
                </Title>
                <WidgetProfitsTable />
            </div>
            <div>
                <Title level={5} className={cnTableTitle}>
                    ARB Volume Stats
                </Title>
                <WidgetARBVolumeTable />
            </div>
            <div>
                <Title level={5} className={cnTableTitle}>
                    ARB Maker Volume Stats
                </Title>
                <WidgetARBMakerTable />
            </div>
            <div>
                <Title level={5} className={cnTableTitle}>
                    ARB Taker Volume Stats
                </Title>
                <WidgetARBTakerTable />
            </div>
            <div>
                <Title level={5} className={cnTableTitle}>
                    ARB Fees Stats
                </Title>
                <WidgetARBFeesTable />
            </div>
        </div>
    );
}
