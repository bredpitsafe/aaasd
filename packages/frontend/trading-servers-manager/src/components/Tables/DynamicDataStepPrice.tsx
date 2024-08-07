import { InfoCircleOutlined } from '@ant-design/icons';
import type {
    TInstrumentDynamicDataPriceStepRules,
    TInstrumentDynamicDataPriceStepRulesTablePriceStepTableRow,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ColDef } from '@frontend/ag-grid/src/ag-grid-community.ts';
import { AgTable } from '@frontend/common/src/components/AgTable/AgTable.tsx';
import { Tooltip } from '@frontend/common/src/components/Tooltip.tsx';
import type { TWithClassname } from '@frontend/common/src/types/components.ts';
import { getInstrumentStepPrice } from '@frontend/common/src/utils/instruments/getInstrumentStepPrice.ts';
import { isEmpty, isNil, isNumber } from 'lodash-es';
import { memo, useMemo } from 'react';

import { cnInfoTooltipIcon, cnStepPriceTooltip, cnStepPriceTooltipTable } from './view.css.ts';

export const DynamicDataStepPrice = memo(
    ({
        className,
        priceStepRules,
    }: TWithClassname & { priceStepRules: TInstrumentDynamicDataPriceStepRules }) => {
        if (isNil(priceStepRules)) {
            return null;
        }

        const stepPrice = getInstrumentStepPrice(priceStepRules);

        if (
            isNil(stepPrice) ||
            isNumber(stepPrice) ||
            priceStepRules.value?.type !== 'table' ||
            priceStepRules.value.table.rows.length <= 1
        ) {
            return isEmpty(className) ? (
                <>{stepPrice}</>
            ) : (
                <span className={className}>{stepPrice}</span>
            );
        }

        return (
            <Tooltip
                title={<StepPriceTooltipContent rows={priceStepRules.value.table.rows} />}
                destroyTooltipOnHide
                color="white"
                zIndex={1000}
                mouseEnterDelay={1}
                overlayClassName={cnStepPriceTooltip}
                trigger="click"
            >
                {isEmpty(className) ? (
                    <>
                        {stepPrice[0]} - {stepPrice[1]}
                        <InfoCircleOutlined className={cnInfoTooltipIcon} />
                    </>
                ) : (
                    <span className={className}>
                        {stepPrice[0]} - {stepPrice[1]}
                        <InfoCircleOutlined className={cnInfoTooltipIcon} />
                    </span>
                )}
            </Tooltip>
        );
    },
);

const StepPriceTooltipContent = memo(
    ({ rows }: { rows: TInstrumentDynamicDataPriceStepRulesTablePriceStepTableRow[] }) => {
        const columns = useMemo<
            ColDef<TInstrumentDynamicDataPriceStepRulesTablePriceStepTableRow>[]
        >(
            () => [
                {
                    field: 'upperBoundaryPrice',
                    headerName: 'Boundary',
                    sortable: false,
                    filter: false,
                    sort: 'asc',
                },
                {
                    field: 'step',
                    headerName: 'Step',
                    sortable: false,
                    filter: false,
                },
            ],
            [],
        );

        return (
            <AgTable<TInstrumentDynamicDataPriceStepRulesTablePriceStepTableRow>
                className={cnStepPriceTooltipTable}
                rowKey="upperBoundaryPrice"
                rowData={rows}
                columnDefs={columns}
                suppressColumnVirtualisation
                suppressRowVirtualisation
                domLayout="autoHeight"
                rowSelection="multiple"
            />
        );
    },
);
