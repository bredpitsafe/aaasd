import { TSeriesId } from '@frontend/charter/lib/Parts/def';
import { TChartProps } from '@frontend/charter/src/services/ChartsController';
import { DragAndDrop } from '@frontend/common/src/components/DragAndDrop';
import { ETDragonActionType, TDragAction } from '@frontend/common/src/hooks/useDragAndDrop/def';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { cnAbsoluteFit, cnFit } from '@frontend/common/src/utils/css/common.css';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useState } from 'react';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

import { TChartJSON, TChartWithItems } from '../../types';
import { Panel } from '../Panel/view';
import { convertToChart } from './utils';
import { cnRoot } from './view.css';

export function Page() {
    const [charts, setCharts] = useState<TChartWithItems[]>(EMPTY_ARRAY);

    const handleDrop = useFunction((action: TDragAction) => {
        if (action.type === ETDragonActionType.Native) {
            const file = action.payload.getAsFile();

            file &&
                from(file.text())
                    .pipe(
                        map((v) => JSON.parse(v)),
                        map(convertToChart),
                    )
                    .subscribe((chart) => {
                        setCharts((v) => v.concat(chart));
                    });
        }
    });
    const sortCharts = useFunction((ids: TSeriesId[]) =>
        setCharts((cs) =>
            ids
                .map((id) => cs.find((c) => c.id === id))
                .filter((v): v is TChartJSON => v !== undefined),
        ),
    );
    const upsertChart = useFunction((chart: TChartProps) => {
        setCharts((charts) =>
            charts.map((c) =>
                c.id !== chart.id
                    ? c
                    : {
                          ...c,
                          ...chart,
                      },
            ),
        );
    });
    const deleteChart = useFunction((id: TSeriesId) =>
        setCharts((charts) => charts.filter((c) => c.id !== id)),
    );

    return (
        <div className={cnRoot}>
            <Panel
                className={cnFit}
                charts={charts}
                sortCharts={sortCharts}
                updateChart={upsertChart}
                deleteChart={deleteChart}
            />
            <DragAndDrop className={cnAbsoluteFit} onDrop={handleDrop} />
        </div>
    );
}
