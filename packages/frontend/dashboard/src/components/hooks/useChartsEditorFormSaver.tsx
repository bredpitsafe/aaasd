import type { TSeriesId } from '@frontend/charter/lib/Parts/def';
import { EChartType } from '@frontend/charter/src/components/Chart/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type { TPromqlQuery } from '@frontend/common/src/utils/Promql';
import { Promql } from '@frontend/common/src/utils/Promql';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { cloneDeep, isEmpty, isEqual, isNil, isString, omit, omitBy } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import { useDeepCompareEffect } from 'react-use';

import type { TChartPanel, TChartPanelChartProps, TPanelId } from '../../types/panel';
import { createChartPanelChartProps } from '../../utils/panels';

export type TUpdateChartsDto = Record<TPanelId, TChartPanel>;

type TConvertedPanelsData = Record<TPanelId, TChartPanelChartProps[]>;

export type TValueType =
    | string
    | number
    | boolean
    | TSeriesId
    | TPromqlQuery
    | TSocketURL
    | undefined;

type TEditorErrors = Record<TChartPanelChartProps['id'], string | undefined>;

export type THandleSetValidationError = (
    chartId: TChartPanelChartProps['id'],
    validationError: string | undefined,
) => void;

function convertChartsToMap(panels: TChartPanel[]) {
    return panels.reduce<TConvertedPanelsData>((acc, cur) => {
        acc[cur.panelId] = cloneDeep(cur.charts);
        return acc;
    }, {});
}

function trimStringValue(value: TValueType) {
    if (isString(value)) {
        return value.trim();
    }
    return value;
}

export function useChartsEditorFormSaver(
    onChartsChange: (dto: TUpdateChartsDto) => unknown,
    panels: TChartPanel[] | undefined,
) {
    const originalFields = useMemo(() => panels || [], [panels]);

    const convertedOriginalFields = useMemo(
        () => convertChartsToMap(originalFields),
        [originalFields],
    );

    useDeepCompareEffect(() => {
        setChangedFields(convertedOriginalFields);
    }, [originalFields]);

    const [changedFields, setChangedFields] = useState(convertChartsToMap(panels || []));

    const [errors, setErrors] = useState<TEditorErrors>({});

    const [isProcessing, setIsProcessing] = useState(false);
    const isDirty = useMemo(
        () => !isEqual(convertedOriginalFields, changedFields),
        [convertedOriginalFields, changedFields],
    );

    const isAllFieldsValid = useMemo(() => isEmpty(errors), [errors]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isDirty) {
                event.preventDefault();
                event.returnValue = true;
            }
        };
        if (isDirty) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const handleEditCharts = useFunction(
        (
            panelId: TPanelId,
            chartId: TChartPanelChartProps['id'],
            field: keyof TChartPanelChartProps,
            value,
        ) => {
            setChangedFields((prev) => {
                const charts = [...prev[panelId]];
                const chartIndex = charts.findIndex((existChart) => existChart.id === chartId);

                const updatedChart = { ...charts[chartIndex], [field]: value };
                charts[chartIndex] = updatedChart;
                return { ...prev, [panelId]: charts };
            });
        },
    );

    const handleSetError = useFunction(
        (chartId: TChartPanelChartProps['id'], error: string | undefined) => {
            setErrors((prev) => {
                return omitBy(
                    {
                        ...prev,
                        [chartId]: error,
                    },
                    isNil,
                );
            });
        },
    );

    const handleSortCharts = useFunction((panelId: TPanelId, charts: TChartPanelChartProps[]) => {
        setChangedFields((prev) => {
            return { ...prev, [panelId]: charts };
        });
    });

    const handleDeleteChart = useFunction((panelId: TPanelId, chartId: TSeriesId) => {
        setErrors((prev) => {
            if (!isNil(prev[chartId])) {
                return omit(prev, chartId);
            }
            return prev;
        });

        setChangedFields((prev) => {
            return { ...prev, [panelId]: prev[panelId].filter((c) => c.id !== chartId) };
        });
    });

    const handleAddChart = useFunction((panelId: TPanelId) => {
        setChangedFields((prev) => {
            const updatedCharts = prev[panelId].concat(
                createChartPanelChartProps(
                    {
                        query: Promql.createQuery('indicators', {
                            name: '',
                        }),
                        type: EChartType.stairs,
                    },
                    prev[panelId].length,
                ),
            );
            return { ...prev, [panelId]: updatedCharts };
        });
    });

    const handleApply = useFunction(async () => {
        setIsProcessing(true);

        try {
            const dtoDataToUpdate = originalFields.reduce<TUpdateChartsDto>((acc, cur) => {
                const trimmedCharts = changedFields[cur.panelId].map((chart) => {
                    for (const key in chart) {
                        //@ts-ignore
                        chart[key] = trimStringValue(chart[key]);
                    }
                    return chart;
                });

                acc[cur.panelId] = { ...cur, charts: trimmedCharts };
                return acc;
            }, {});

            await onChartsChange(dtoDataToUpdate);
        } finally {
            setIsProcessing(false);
        }
    });

    const handleDiscard = useFunction(() => {
        setChangedFields(convertedOriginalFields);
        setErrors({});
    });

    return {
        handleEditCharts,
        changedFields,
        handleApply,
        handleDiscard,
        isProcessing,
        isDirty,
        handleSetError,
        isAllFieldsValid,
        handleSortCharts,
        handleDeleteChart,
        handleAddChart,
    };
}
