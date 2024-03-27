import { OrderedListOutlined } from '@ant-design/icons';
import { Suspense } from '@frontend/common/src/components/Suspense';
import { cnFit } from '@frontend/common/src/utils/css/common.css';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import { lazily } from 'react-lazily';

import type { TChartPanel, TChartPanelChartProps, TPanel } from '../../../types/panel';
import { isChartPanel } from '../../../types/panel/guards';
import { usePanelChartEditActions } from '../../hooks/usePanelChartEditActions';
import type { TPanelTab } from '../../Panel/view';

const { TableChartsEditor } = lazily(() => import('../../Tables/TableChartsEditor'));

export function useConnectedPanelTabForm(panel: TPanel): undefined | TPanelTab {
    return useConnectedChartPanelTabForm(isChartPanel(panel) ? panel : undefined);
}

function useConnectedChartPanelTabForm(panel: undefined | TChartPanel): TPanelTab | undefined {
    const isChartPanel = !isNil(panel);
    const { addChart, deleteChart, updateChart, sortCharts } = usePanelChartEditActions();

    const handleAddPanel = useFunction(() => (isChartPanel ? addChart(panel) : undefined));
    const handleDeletePanel = useFunction((id: TChartPanelChartProps['id']) =>
        isChartPanel ? deleteChart(panel, id) : undefined,
    );
    const handleUpsertPanel = useFunction((chart: TChartPanelChartProps) =>
        isChartPanel ? updateChart(panel, chart) : undefined,
    );
    const handleSortPanels = useFunction((charts: TChartPanelChartProps[]) =>
        isChartPanel ? sortCharts(panel, charts) : undefined,
    );

    if (isNil(panel) || !isChartPanel) {
        return undefined;
    }

    return {
        name: 'Charts',
        icon: <OrderedListOutlined />,
        child: (
            <Suspense>
                <TableChartsEditor
                    className={cnFit}
                    charts={panel.charts}
                    onAdd={handleAddPanel}
                    onDelete={handleDeletePanel}
                    onChange={handleUpsertPanel}
                    onSort={handleSortPanels}
                />
            </Suspense>
        ),
    };
}
