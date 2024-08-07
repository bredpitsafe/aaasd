import { DeleteOutlined } from '@ant-design/icons';
import type { ICellRendererParams, ValueGetterParams } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue.ts';
import type { TColDef } from '@frontend/ag-grid/src/types';
import { EChartType } from '@frontend/charter/src/components/Chart/defs';
import { EVirtualViewport } from '@frontend/charter/src/components/ChartViewport/defs';
import { Button } from '@frontend/common/src/components/Button';
import { InputNumber } from '@frontend/common/src/components/InputNumber';
import { Option, Select } from '@frontend/common/src/components/Select';
import { Switch } from '@frontend/common/src/components/Switch';
import { EDefaultColors } from '@frontend/common/src/utils/colors';
import { Promql } from '@frontend/common/src/utils/Promql';
import { validateNumberConversionFnBody } from '@frontend/common/src/utils/Sandboxes/numberConversion';
import { isEmpty, isNil } from 'lodash-es';
import type { ReactElement } from 'react';

import type { TChartPanelChartProps } from '../../../types/panel';
import { getPanelLabel } from '../../../utils/panels';
import { DEFAULT_CHART_PROPS } from '../../Chart/def';
import type { THandleSetValidationError } from '../../hooks/useChartsEditorFormSaver';
import { TableColorPicker } from './components/ColorPicker';
import { InputWithError } from './components/InputWithError';
import type { TFieldUpdater } from './fieldUpdaterFactory';
import { fieldUpdaterFactory } from './fieldUpdaterFactory';
import { cnInput, cnInputCell, cnTextInput } from './index.css';

const INPUT_COLUMN_COMMON_PROPS: Pick<
    TColDef<TChartPanelChartProps>,
    'cellClass' | 'suppressKeyboardEvent'
> = {
    cellClass: () => cnInputCell,
    suppressKeyboardEvent: () => true,
};

export function getColumnQuery(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    const valueGetter = (params: ValueGetterParams<TChartPanelChartProps>) =>
        params.data && AgValue.create(params.data.query, params.data, ['id']);

    return {
        headerName: 'Query',
        minWidth: 150,
        colId: 'query',
        valueGetter,
        equals: AgValue.isEqual,
        cellRenderer: (params: ICellRendererParams<ReturnType<typeof valueGetter>>) => {
            if (isNil(params.value)) return null;

            const data = params.value.data;
            const value = params.value.payload;

            return (
                <InputWithError
                    className={cnTextInput}
                    size="small"
                    defaultValue={value}
                    required
                    placeholder={`indicators{name='%INDICATOR_NAME%'}`}
                    status={
                        isEmpty(Promql.tryParseQuery(value)?.labels?.name) ? 'error' : undefined
                    }
                    onChange={fieldUpdaterFactory('query', data.id, onChange)}
                />
            );
        },
        ...INPUT_COLUMN_COMMON_PROPS,
    };
}

export function getColumnLabel(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    const valueGetter = (params: ValueGetterParams<TChartPanelChartProps>) =>
        params.data && AgValue.create(params.data.label, params.data, ['id', 'query']);

    return {
        colId: 'label',
        headerName: 'Legend label',
        minWidth: 150,
        valueGetter,
        equals: AgValue.isEqual,
        cellRenderer: (params: ICellRendererParams<ReturnType<typeof valueGetter>>) => {
            if (isNil(params.value)) return null;
            const data = params.value.data;
            const value = params.value.payload;

            return (
                <InputWithError
                    className={cnTextInput}
                    defaultValue={value}
                    size="small"
                    placeholder={getPanelLabel(data, 'Legend label')}
                    onChange={fieldUpdaterFactory('label', data.id, onChange)}
                />
            );
        },
        ...INPUT_COLUMN_COMMON_PROPS,
    };
}

export function getColumnLabelFormat(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    const valueGetter = (params: ValueGetterParams<TChartPanelChartProps>) =>
        params.data && AgValue.create(params.data.labelFormat, params.data, ['id']);

    return {
        colId: 'labelFormat',
        headerName: 'Format',
        minWidth: 100,
        valueGetter,
        equals: AgValue.isEqual,
        cellRenderer: (params: ICellRendererParams<ReturnType<typeof valueGetter>>) => {
            if (isNil(params.value)) return null;

            const data = params.value.data;
            const value = params.value.payload;

            return (
                <InputWithError
                    className={cnTextInput}
                    size="small"
                    title="Format for label and last value"
                    placeholder="%s: %.4g"
                    defaultValue={value}
                    onChange={fieldUpdaterFactory('labelFormat', data.id, onChange)}
                />
            );
        },
        ...INPUT_COLUMN_COMMON_PROPS,
    };
}

export function getColumnWidth(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    const valueGetter = (params: ValueGetterParams<TChartPanelChartProps>) =>
        params.data && AgValue.create(params.data.width, params.data, ['id']);

    return {
        colId: 'width',
        headerName: 'Width',
        maxWidth: 60,
        minWidth: 60,
        resizable: false,
        valueGetter,
        equals: AgValue.isEqual,
        cellRenderer: (params: ICellRendererParams<ReturnType<typeof valueGetter>>) => {
            if (isNil(params.value)) return null;

            const data = params.value.data;
            const value = params.value.payload;

            return (
                <InputNumber
                    className={cnTextInput}
                    size="small"
                    value={value}
                    placeholder={String(DEFAULT_CHART_PROPS.width)}
                    onChange={
                        fieldUpdaterFactory('width', data.id, onChange) as (
                            value: number | null,
                        ) => void
                    }
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
    const valueGetter = (params: ValueGetterParams<TChartPanelChartProps>) =>
        params.data && AgValue.create(params.data.color, params.data, ['id']);

    return {
        colId: 'color',
        headerName: 'Color',
        maxWidth: 55,
        minWidth: 55,
        resizable: false,
        valueGetter,
        equals: AgValue.isEqual,
        cellRenderer: (params: ICellRendererParams<ReturnType<typeof valueGetter>>) => {
            if (isNil(params.value)) return null;

            const data = params.value.data;
            const value = params.value.payload;

            return (
                <TableColorPicker
                    id={data.id}
                    color={value ?? EDefaultColors.chart}
                    onSelectColor={fieldUpdaterFactory('color', data.id, onChange)}
                />
            );
        },
    };
}

export function getColumnOpacity(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    const valueGetter = (params: ValueGetterParams<TChartPanelChartProps>) =>
        params.data && AgValue.create(params.data.opacity, params.data, ['id']);

    return {
        colId: 'opacity',
        headerName: 'Opacity',
        maxWidth: 65,
        minWidth: 65,
        resizable: false,
        valueGetter,
        equals: AgValue.isEqual,
        cellRenderer: (params: ICellRendererParams<ReturnType<typeof valueGetter>>) => {
            if (isNil(params.value)) return null;

            const data = params.value.data;
            const value = params.value.payload;

            return (
                <InputNumber
                    className={cnTextInput}
                    size="small"
                    value={value}
                    placeholder={String(DEFAULT_CHART_PROPS.opacity)}
                    onChange={
                        fieldUpdaterFactory('opacity', data.id, onChange) as (
                            value: number | null,
                        ) => void
                    }
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
    const valueGetter = (params: ValueGetterParams<TChartPanelChartProps>) =>
        params.data && AgValue.create(params.data.legend, params.data, ['id']);

    return {
        colId: 'legend',
        headerName: 'Legend',
        maxWidth: 65,
        minWidth: 65,
        resizable: false,
        valueGetter,
        equals: AgValue.isEqual,
        cellRenderer: (params: ICellRendererParams<ReturnType<typeof valueGetter>>) => {
            if (isNil(params.value)) return null;

            const data = params.value.data;
            const value = params.value.payload;

            return (
                <Switch
                    className={cnInput}
                    size="small"
                    checked={value ?? true}
                    onChange={fieldUpdaterFactory('legend', data.id, onChange)}
                />
            );
        },
    };
}

export function getColumnType(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    const valueGetter = (params: ValueGetterParams<TChartPanelChartProps>) =>
        params.data && AgValue.create(params.data.type, params.data, ['id']);

    return {
        colId: 'type',
        headerName: 'Type',
        minWidth: 100,
        resizable: true,
        valueGetter,
        equals: AgValue.isEqual,
        cellRenderer: (params: ICellRendererParams<ReturnType<typeof valueGetter>>) => {
            if (isNil(params.value)) return null;

            const data = params.value.data;
            const value = params.value.payload;

            return (
                <Select
                    className={cnTextInput}
                    size="small"
                    value={value}
                    placeholder={DEFAULT_CHART_PROPS.type}
                    onChange={fieldUpdaterFactory('type', data.id, onChange)}
                >
                    {getOptionsFromEnum(EChartType)}
                </Select>
            );
        },
        ...INPUT_COLUMN_COMMON_PROPS,
    };
}

export function getColumnVisible(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    const valueGetter = (params: ValueGetterParams<TChartPanelChartProps>) =>
        params.data && AgValue.create(params.data.visible, params.data, ['id']);

    return {
        colId: 'visible',
        headerName: 'Visible',
        maxWidth: 65,
        minWidth: 65,
        resizable: false,
        valueGetter,
        equals: AgValue.isEqual,
        cellRenderer: (params: ICellRendererParams<ReturnType<typeof valueGetter>>) => {
            if (isNil(params.value)) return null;

            const data = params.value.data;
            const value = params.value.payload;

            return (
                <Switch
                    className={cnInput}
                    size="small"
                    checked={value ?? DEFAULT_CHART_PROPS.visible}
                    onChange={fieldUpdaterFactory('visible', data.id, onChange)}
                />
            );
        },
    };
}
export function getColumnYAxis(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    const valueGetter = (params: ValueGetterParams<TChartPanelChartProps>) =>
        params.data && AgValue.create(params.data.yAxis, params.data, ['id']);

    return {
        colId: 'yAxis',
        headerName: 'Axis',
        minWidth: 100,
        resizable: true,
        valueGetter,
        equals: AgValue.isEqual,
        cellRenderer: (params: ICellRendererParams<ReturnType<typeof valueGetter>>) => {
            if (isNil(params.value)) return null;

            const data = params.value.data;
            const value = params.value.payload;

            return (
                <Select
                    className={cnTextInput}
                    size="small"
                    value={value ?? EVirtualViewport.left}
                    onChange={fieldUpdaterFactory('yAxis', data.id, onChange)}
                >
                    {getOptionsFromEnum(EVirtualViewport)}
                </Select>
            );
        },
        ...INPUT_COLUMN_COMMON_PROPS,
    };
}
export function getColumnGroup(onChange: TFieldUpdater): TColDef<TChartPanelChartProps> {
    const valueGetter = (params: ValueGetterParams<TChartPanelChartProps>) =>
        params.data && AgValue.create(params.data.group, params.data, ['id']);

    return {
        colId: 'group',
        headerName: 'Group',
        minWidth: 100,
        valueGetter,
        equals: AgValue.isEqual,
        cellRenderer: (params: ICellRendererParams<ReturnType<typeof valueGetter>>) => {
            if (isNil(params.value)) return null;

            const data = params.value.data;
            const value = params.value.payload;

            return (
                <InputWithError
                    className={cnTextInput}
                    size="small"
                    defaultValue={String(value ?? '')}
                    onChange={fieldUpdaterFactory('group', data.id, onChange)}
                />
            );
        },
        ...INPUT_COLUMN_COMMON_PROPS,
    };
}

const FORMULA_PLACEHOLDER = 'value * 2 - 1';
export function getColumnFormula(
    onChange: TFieldUpdater,
    onSetError: THandleSetValidationError,
): TColDef<TChartPanelChartProps> {
    const valueGetter = (params: ValueGetterParams<TChartPanelChartProps>) =>
        params.data && AgValue.create(params.data.formula, params.data, ['id']);

    return {
        colId: 'formula',
        headerName: 'Formula',
        minWidth: 150,
        valueGetter,
        equals: AgValue.isEqual,
        cellRenderer: (params: ICellRendererParams<ReturnType<typeof valueGetter>>) => {
            if (isNil(params.value)) return null;

            const data = params.value.data;
            const value = params.value.payload;

            return (
                <InputWithError
                    className={cnTextInput}
                    size="small"
                    placeholder={FORMULA_PLACEHOLDER}
                    defaultValue={value}
                    onChange={fieldUpdaterFactory('formula', data.id, onChange)}
                    onValidate={(value) => {
                        if (isEmpty(value.trim()) || validateNumberConversionFnBody(value)) {
                            onSetError(data.id, undefined);
                            return undefined;
                        } else {
                            const validationError = `Formula "${value.trim()}" is invalid and will not be saved`;
                            onSetError(data.id, validationError);
                            return validationError;
                        }
                    }}
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
        width: 42,
        field: 'id',
        cellRenderer: ({
            value,
        }: ICellRendererParams<TChartPanelChartProps['id'], TChartPanelChartProps>) =>
            isNil(value) ? null : (
                <Button size="small" icon={<DeleteOutlined />} onClick={() => onClick(value)} />
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
