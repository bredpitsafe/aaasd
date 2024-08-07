import { isNil } from 'lodash-es';

import type { TChartPanelChartProps } from '../../../types/panel';

export type TFieldUpdater = (
    field: keyof TChartPanelChartProps,
    id: TChartPanelChartProps['id'],
    value: TChartPanelChartProps[keyof TChartPanelChartProps],
) => void;

export const fieldUpdaterFactory =
    (
        field: keyof TChartPanelChartProps,
        id: TChartPanelChartProps['id'],
        onChange: TFieldUpdater,
    ) =>
    (value: TChartPanelChartProps[keyof TChartPanelChartProps]) => {
        if (isNil(value)) {
            value = undefined;
        }

        onChange(field, id, value);
    };
