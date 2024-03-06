import { assert } from '@frontend/common/src/utils/assert';
import { ICellRendererParams } from 'ag-grid-community';
import { isEmpty, isNil, isString } from 'lodash-es';

import type { TChartPanelChartProps } from '../../../types/panel';

export type TFieldUpdater = (
    field: keyof TChartPanelChartProps,
    id: TChartPanelChartProps['id'],
    value: TChartPanelChartProps[keyof TChartPanelChartProps],
) => void;

export const fieldUpdaterFactory =
    (params: ICellRendererParams<TChartPanelChartProps>, onChange: TFieldUpdater) =>
    (v: TChartPanelChartProps[keyof TChartPanelChartProps]) => {
        const { colDef, data } = params;
        assert(!isNil(colDef?.field), 'colDef.field should not be nil');
        assert(!isNil(data), 'data should not be nil');
        const field = colDef?.field as keyof TChartPanelChartProps;

        let value = v;
        if (isString(value)) {
            value = value.trim();
            if (isEmpty(value)) {
                value = undefined;
            }
        }

        if (isNil(value)) {
            value = undefined;
        }

        onChange(field, data.id, value);
    };
