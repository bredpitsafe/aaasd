import { InfoCircleOutlined } from '@ant-design/icons';
import type { ColDef, ICellRendererParams, ValueFormatterParams } from '@frontend/ag-grid';
import { AgTable } from '@frontend/common/src/components/AgTable/AgTable.tsx';
import { Tooltip } from '@frontend/common/src/components/Tooltip.tsx';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument.ts';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import { getInstrumentStepPrice } from '@frontend/common/src/utils/instruments/getInstrumentStepPrice.ts';
import { getInstrumentStepQty } from '@frontend/common/src/utils/instruments/getInstrumentStepQty.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    isFailValueDescriptor,
    matchValueDescriptor,
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { memo, useContext, useMemo } from 'react';
import { of } from 'rxjs';

import { cnInfoTooltipIcon } from '../view.css.ts';
import { DynamicDataContext } from './DynamicDataContext.ts';
import { cnDynamicDataTooltip, cnDynamicDataTooltipTable, cnLabelName } from './styles.css.ts';

export const InstrumentIdRenderer = memo(
    ({ value, data }: ICellRendererParams<string, TInstrument>) => {
        return (
            <div>
                {value}
                {!isNil(data) && (
                    <Tooltip
                        title={<TooltipContent instrument={data} />}
                        destroyTooltipOnHide
                        color="white"
                        zIndex={1000}
                        mouseEnterDelay={1}
                        overlayClassName={cnDynamicDataTooltip}
                        trigger="click"
                    >
                        <InfoCircleOutlined className={cnInfoTooltipIcon} />
                    </Tooltip>
                )}
            </div>
        );
    },
);

const TooltipContent = memo(({ instrument }: { instrument: TInstrument }) => {
    const subscribeToInstrumentDynamicData = useContext(DynamicDataContext);

    const dynamicDataDesc = useNotifiedValueDescriptorObservable(
        useMemo(
            () =>
                isNil(subscribeToInstrumentDynamicData)
                    ? of(WAITING_VD)
                    : subscribeToInstrumentDynamicData(instrument.id),
            [subscribeToInstrumentDynamicData, instrument],
        ),
    );

    const columns = useMemo<
        ColDef<{ field: string; value: undefined | number | [number, number] }>[]
    >(
        () => [
            {
                field: 'field',
                headerName: 'Field',
                cellClass: () => cnLabelName,
                sortable: false,
                filter: false,
            },
            {
                field: 'value',
                headerName: 'Value',
                sortable: false,
                filter: false,
                valueFormatter: ({
                    value,
                }: ValueFormatterParams<
                    {
                        field: string;
                        value: ReturnType<typeof getInstrumentStepPrice> | number | undefined;
                    },
                    ReturnType<typeof getInstrumentStepPrice> | number | undefined
                >) => {
                    if (isNil(value)) {
                        return '—';
                    }

                    if (Array.isArray(value)) {
                        return `${value[0]} - ${value[1]}`;
                    }

                    return value.toString();
                },
            },
        ],
        [],
    );

    const rows = useMemo(
        () =>
            matchValueDescriptor(dynamicDataDesc, {
                unsynced(vd) {
                    return isFailValueDescriptor(vd)
                        ? (EMPTY_ARRAY as {
                              field: string;
                              value: ReturnType<typeof getInstrumentStepPrice> | number | undefined;
                          }[])
                        : undefined;
                },
                synced({ value }): {
                    field: string;
                    value: ReturnType<typeof getInstrumentStepPrice> | number | undefined;
                }[] {
                    return isNil(value)
                        ? EMPTY_ARRAY
                        : [
                              { field: 'Min. Price', value: value.minPrice },
                              { field: 'Max. Price', value: value.maxPrice },
                              { field: 'Min. Qty', value: value.minQty },
                              { field: 'Max. Qty', value: value.maxQty },
                              { field: 'Min. Volume', value: value.minVolume },
                              {
                                  field: 'Step Price',
                                  value: getInstrumentStepPrice(value.priceStepRules),
                              },
                              {
                                  field: 'Step Qty',
                                  value: getInstrumentStepQty(value.amountStepRules),
                              },
                          ];
                },
            }),
        [dynamicDataDesc],
    );

    return (
        <AgTable
            className={cnDynamicDataTooltipTable}
            rowKey="field"
            rowData={rows}
            columnDefs={columns}
            suppressColumnVirtualisation
            suppressRowVirtualisation
            domLayout="autoHeight"
            headerHeight={0}
            rowSelection="multiple"
        />
    );
});
