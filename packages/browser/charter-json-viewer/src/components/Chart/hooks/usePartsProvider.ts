import { TSeriesId } from '@frontend/charter/lib/Parts/def';
import { createPartsArrayProvider } from '@frontend/charter/lib/Parts/PartsArrayProvider';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { hexToPackedRGBA } from '@frontend/common/src/utils/packRGBA';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useMemo } from 'react';

import { TChartWithItems } from '../../../types';

export function usePartsProvider(props: { charts: TChartWithItems[] }) {
    const mapIdToPoints = useMemo(() => {
        return props.charts.reduce(
            (acc, c) => ((acc[c.id] = c.items), acc),
            {} as Record<TSeriesId, number[]>,
        );
    }, [props.charts]);

    const getPoints = useFunction((id: TSeriesId) => mapIdToPoints[id] ?? EMPTY_ARRAY);
    const getColor = useFunction((id: TSeriesId) =>
        hexToPackedRGBA(
            props.charts.find((c) => c.id === id)?.color,
            props.charts.find((c) => c.id === id)?.opacity,
        ),
    );
    const getWidth = useFunction(
        (id: TSeriesId) => props.charts.find((c) => c.id === id)?.width ?? 1,
    );

    return useMemo(
        () => createPartsArrayProvider(getPoints, getColor, getWidth),
        [getColor, getPoints, getWidth],
    );
}
