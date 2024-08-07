import { LineChartOutlined } from '@ant-design/icons';
import { assertNever } from '@common/utils/src/assert.ts';
import type { IPlugin } from '@frontend/charter/src/plugins/Plugin';
import { Suspense } from '@frontend/common/src/components/Suspense';
import { useMemo } from 'react';
import { lazily } from 'react-lazily';

import type { TPanel } from '../../../types/panel';
import {
    isChartPanel,
    isCustomViewGridPanel,
    isCustomViewTablePanel,
} from '../../../types/panel/guards';
import type { TPanelTab } from '../../Panel/view';

const { ConnectedChart } = lazily(() => import('../components/ConnectedChart'));
const { ConnectedIndicatorsGrid } = lazily(() => import('../components/ConnectedIndicatorsGrid'));
const { ConnectedIndicatorsTable } = lazily(() => import('../components/ConnectedIndicatorsTable'));

export function useConnectedMainTab(panel: TPanel, chartPlugins: IPlugin[]): TPanelTab {
    return useMemo(() => {
        if (isChartPanel(panel)) {
            return {
                name: 'View',
                icon: <LineChartOutlined />,
                child: (
                    <Suspense>
                        <ConnectedChart panel={panel} plugins={chartPlugins} />
                    </Suspense>
                ),
            };
        }

        if (isCustomViewTablePanel(panel)) {
            return {
                name: 'View',
                icon: <LineChartOutlined />,
                child: (
                    <Suspense>
                        <ConnectedIndicatorsTable panel={panel} />
                    </Suspense>
                ),
            };
        }

        if (isCustomViewGridPanel(panel)) {
            return {
                name: 'View',
                icon: <LineChartOutlined />,
                child: (
                    <Suspense>
                        <ConnectedIndicatorsGrid panel={panel} />
                    </Suspense>
                ),
            };
        }

        assertNever(panel);
    }, [panel, chartPlugins]);
}
