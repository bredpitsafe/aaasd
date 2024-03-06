import { LineChartOutlined, OrderedListOutlined } from '@ant-design/icons';
import { TSeriesId } from '@frontend/charter/lib/Parts/def';
import { TChartProps } from '@frontend/charter/src/services/ChartsController';
import { TWithClassname } from '@frontend/common/src/types/components';
import { cnFit } from '@frontend/common/src/utils/css/common.css';
import { PanelView } from '@frontend/dashboard/src/components/Panel/view';
import { useMemo } from 'react';

import { TChartWithItems } from '../../types';
import { ConnectedChart } from '../Chart';
import { TableChartsEditor } from '../TableChartsEditor';

export function Panel(
    props: TWithClassname & {
        charts: TChartWithItems[];
        sortCharts: (ids: TSeriesId[]) => void;
        updateChart: (chart: TChartProps) => void;
        deleteChart: (id: TSeriesId) => void;
    },
) {
    const tabChart = useMemo(() => {
        return {
            name: 'Charts',
            child: <ConnectedChart className={cnFit} charts={props.charts} />,
            icon: <LineChartOutlined />,
        };
    }, [props.charts]);
    const form = {
        name: 'Form',
        child: (
            <TableChartsEditor
                style={{ height: '100%' }}
                charts={props.charts}
                onSort={props.sortCharts}
                onChange={props.updateChart}
                onDelete={props.deleteChart}
            />
        ),
        icon: <OrderedListOutlined />,
    };

    return <PanelView className={props.className} tabs={[tabChart, form]} />;
}
