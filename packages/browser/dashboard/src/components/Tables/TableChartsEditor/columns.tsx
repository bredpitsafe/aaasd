import { DeleteOutlined } from '@ant-design/icons';
import { EChartType } from '@frontend/charter/src/components/Chart/defs';
import { EVirtualViewport } from '@frontend/charter/src/components/ChartViewport/defs';
import type { TColDef } from '@frontend/common/src/components/AgTable/types';
import { Button } from '@frontend/common/src/components/Button';
import { Option, Select } from '@frontend/common/src/components/Select';
import { Switch } from '@frontend/common/src/components/Switch';
import { EDefaultColors } from '@frontend/common/src/utils/colors';
import { Promql } from '@frontend/common/src/utils/Promql';
import { validateNumberConversionFnBody } from '@frontend/common/src/utils/Sandboxes/numberConversion';
import type { ICellRendererParams } from 'ag-grid-community';
import { isEmpty, isNil } from 'lodash-es';
import type { ReactElement } from 'react';

import type { TChartPanelChartProps } from '../../../types/panel';
import { getPanelLabel } from '../../../utils/panels';
import { DEFAULT_CHART_PROPS } from '../../Chart/def';
import { TableColorPicker } from './components/ColorPicker';
import { DeferredInput } from './components/DeferredInput';
import { DeferredNumberInput } from './components/DeferredNumberInput';
import { fieldUpdaterFactory, TFieldUpdater } from './fieldUpdaterFactory';
import { cnInput, cnInputCell, cnTextInput } from './index.css';

const INPUT_COLUMN_COMMON_PROPS: Pick<
    TColDef<TChartPanelChartProps>,
    'cellClass' | 'suppressKeyboardEvent'
> = {
    cellClass: () => cnInputCell,
    suppressKeyboardEvent: () => true,
};

export function getColumnQuery(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    return {
        headerName: 'Query',
        field: 'query',
        minWidth: 150,
        cellRenderer: (params: ICellRendererParams<TChartPanelChartProps>) => {
            const { data } = params;
            return isNil(data) ? null : (
                <DeferredInput
                    className={cnTextInput}
                    size="small"
                    value={data.query}
                    required
                    placeholder={`indicators{name='%INDICATOR_NAME%'}`}
                    status={
                        isEmpty(Promql.tryParseQuery(params.data!.query)?.labels?.name)
                            ? 'error'
                            : undefined
                    }
                    onChange={fieldUpdaterFactory(params, onChange)}
                />
            );
        },
        ...INPUT_COLUMN_COMMON_PROPS,
    };
}

export function getColumnLabel(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    return {
        colId: 'label',
        headerName: 'Legend label',
        minWidth: 150,
        field: 'label',
        cellRenderer: (params: ICellRendererParams<TChartPanelChartProps>) => {
            const { data } = params;
            return isNil(data) ? null : (
                <DeferredInput
                    className={cnTextInput}
                    size="small"
                    value={data.label}
                    placeholder={getPanelLabel(data, 'Legend label')}
                    onChange={fieldUpdaterFactory(params, onChange)}
                />
            );
        },
        ...INPUT_COLUMN_COMMON_PROPS,
    };
}

export function getColumnLabelFormat(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    return {
        colId: 'labelFormat',
        headerName: 'Format',
        minWidth: 100,
        field: 'labelFormat',
        cellRenderer: (params: ICellRendererParams<TChartPanelChartProps>) => {
            const { data } = params;
            return isNil(data) ? null : (
                <DeferredInput
                    className={cnTextInput}
                    size="small"
                    title="Format for label and last value"
                    placeholder="%s: %.4g"
                    value={data.labelFormat}
                    onChange={fieldUpdaterFactory(params, onChange)}
                />
            );
        },
        ...INPUT_COLUMN_COMMON_PROPS,
    };
}

export function getColumnWidth(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    return {
        colId: 'width',
        headerName: 'Width',
        maxWidth: 60,
        minWidth: 60,
        resizable: false,
        field: 'width',
        cellRenderer: (params: ICellRendererParams<TChartPanelChartProps>) => {
            const { data } = params;
            return isNil(data) ? null : (
                <DeferredNumberInput
                    className={cnTextInput}
                    size="small"
                    value={data.width}
                    placeholder={String(DEFAULT_CHART_PROPS.width)}
                    onChange={fieldUpdaterFactory(params, onChange)}
                    min={0}
                    max={50}
                    step={1}
                />
            );
        },
        ...INPUT_COLUMN_COMMON_PROPS,
    };
}

export function getColumnColor(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    return {
        colId: 'color',
        headerName: 'Color',
        maxWidth: 55,
        minWidth: 55,
        resizable: false,
        field: 'color',
        cellRenderer: (params: ICellRendererParams<TChartPanelChartProps>) => {
            const { data } = params;
            return isNil(data) ? null : (
                <TableColorPicker
                    id={data.id}
                    color={data.color ?? EDefaultColors.chart}
                    onSelectColor={fieldUpdaterFactory(params, onChange)}
                />
            );
        },
    };
}

export function getColumnOpacity(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    return {
        colId: 'opacity',
        headerName: 'Opacity',
        maxWidth: 65,
        minWidth: 65,
        resizable: false,
        field: 'opacity',
        cellRenderer: (params: ICellRendererParams<TChartPanelChartProps>) => {
            const { data } = params;
            return isNil(data) ? null : (
                <DeferredNumberInput
                    className={cnTextInput}
                    size="small"
                    value={data.opacity}
                    placeholder={String(DEFAULT_CHART_PROPS.opacity)}
                    onChange={fieldUpdaterFactory(params, onChange)}
                    min={0}
                    max={1}
                    step={0.1}
                />
            );
        },
        ...INPUT_COLUMN_COMMON_PROPS,
    };
}

export function getColumnLegend(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    return {
        colId: 'legend',
        headerName: 'Legend',
        maxWidth: 65,
        minWidth: 65,
        resizable: false,
        field: 'legend',
        cellRenderer: (params: ICellRendererParams<TChartPanelChartProps>) => {
            const { data } = params;
            return isNil(data) ? null : (
                <Switch
                    className={cnInput}
                    size="small"
                    checked={data.legend ?? true}
                    onChange={fieldUpdaterFactory(params, onChange)}
                />
            );
        },
    };
}

export function getColumnType(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    return {
        colId: 'type',
        headerName: 'Type',
        maxWidth: 80,
        minWidth: 80,
        resizable: false,
        field: 'type',
        cellRenderer: (params: ICellRendererParams<TChartPanelChartProps>) => {
            const { data } = params;
            return isNil(data) ? null : (
                <Select
                    className={cnTextInput}
                    size="small"
                    value={data.type}
                    placeholder={DEFAULT_CHART_PROPS.type}
                    onChange={fieldUpdaterFactory(params, onChange)}
                >
                    {getOptionsFromEnum(EChartType)}
                </Select>
            );
        },
        ...INPUT_COLUMN_COMMON_PROPS,
    };
}

export function getColumnVisible(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    return {
        colId: 'visible',
        headerName: 'Visible',
        maxWidth: 65,
        minWidth: 65,
        resizable: false,
        field: 'visible',
        cellRenderer: (params: ICellRendererParams<TChartPanelChartProps>) => {
            const { data } = params;
            return isNil(data) ? null : (
                <Switch
                    className={cnInput}
                    size="small"
                    checked={data.visible ?? DEFAULT_CHART_PROPS.visible}
                    onChange={fieldUpdaterFactory(params, onChange)}
                />
            );
        },
    };
}
export function getColumnYAxis(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    return {
        colId: 'yAxis',
        headerName: 'Axis',
        maxWidth: 70,
        minWidth: 70,
        resizable: false,
        field: 'yAxis',
        cellRenderer: (params: ICellRendererParams<TChartPanelChartProps>) => {
            const { data } = params;
            return isNil(data) ? null : (
                <Select
                    className={cnTextInput}
                    size="small"
                    value={data.yAxis ?? EVirtualViewport.left}
                    onChange={fieldUpdaterFactory(params, onChange)}
                >
                    {getOptionsFromEnum(EVirtualViewport)}
                </Select>
            );
        },
        ...INPUT_COLUMN_COMMON_PROPS,
    };
}
export function getColumnGroup(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    return {
        colId: 'group',
        headerName: 'Group',
        minWidth: 100,
        field: 'group',
        cellRenderer: (params: ICellRendererParams<TChartPanelChartProps>) => {
            const { data } = params;
            return isNil(data) ? null : (
                <DeferredInput
                    className={cnTextInput}
                    size="small"
                    value={data.group?.toString() ?? ''}
                    onChange={fieldUpdaterFactory(params, onChange)}
                />
            );
        },
        ...INPUT_COLUMN_COMMON_PROPS,
    };
}

const FORMULA_PLACEHOLDER = 'value * 2 - 1';
export function getColumnFormula(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    return {
        colId: 'formula',
        headerName: 'Formula',
        minWidth: 150,
        field: 'formula',
        cellRenderer: (params: ICellRendererParams<TChartPanelChartProps>) => {
            const { data } = params;

            return isNil(data) ? null : (
                <DeferredInput
                    className={cnTextInput}
                    size="small"
                    placeholder={FORMULA_PLACEHOLDER}
                    value={data.formula}
                    onChange={fieldUpdaterFactory(params, onChange)}
                    onValidate={(value) =>
                        isEmpty(value.trim()) || validateNumberConversionFnBody(value)
                            ? undefined
                            : `Formula "${value.trim()}" is invalid and will not be saved`
                    }
                />
            );
        },
        ...INPUT_COLUMN_COMMON_PROPS,
    };
}

export function getColumnDelete(
    onClick: (id: TChartPanelChartProps['id']) => void,
): TColDef<TChartPanelChartProps> {
    return {
        colId: 'delete',
        headerName: 'Del',
        maxWidth: 42,
        cellRenderer: ({ data }: ICellRendererParams<TChartPanelChartProps>) =>
            isNil(data) ? null : (
                <Button size="small" icon={<DeleteOutlined />} onClick={() => onClick(data.id)} />
            ),
    };
}

function getOptionsFromEnum(_enum: object): ReactElement[] {
    return Object.values(_enum).map((v) => {
        return (
            <Option key={v} value={v}>
                {v}
            </Option>
        );
    });
}
