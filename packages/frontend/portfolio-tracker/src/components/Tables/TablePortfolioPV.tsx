import type { TColDef } from '@frontend/ag-grid/src/types';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { numberFormatter } from '@frontend/common/src/components/AgTable/formatters/number';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { ReactElement, useMemo } from 'react';

type TTablePortfolioPVItem = {
    id: number;
    pv: undefined | number;
    portfolioPv: undefined | number;
    skewReserves: undefined | number;
    theta: undefined | number;
    thetaFx: undefined | number;
};

type TTablePortfolioRisksProps = TWithClassname & Omit<TTablePortfolioPVItem, 'id'>;

export function TablePortfolioPV(props: TTablePortfolioRisksProps): ReactElement {
    const columns = useMemo<TColDef<TTablePortfolioPVItem>[]>(() => getColumns(), []);
    const items = useMemo<TTablePortfolioPVItem[]>(
        () => [
            {
                id: 1,
                pv: props.pv,
                portfolioPv: props.portfolioPv,
                skewReserves: props.skewReserves,
                theta: props.theta,
                thetaFx: props.thetaFx,
            },
        ],
        [props.pv, props.portfolioPv, props.skewReserves, props.theta, props.thetaFx],
    );

    return (
        <div className={props.className}>
            <AgTableWithRouterSync<TTablePortfolioPVItem>
                id={ETableIds.PortfolioRisks}
                rowKey="id"
                rowData={items}
                columnDefs={columns}
                asyncTransactionWaitMillis={1000}
                suppressAnimationFrame={false}
            />
        </div>
    );
}

function getColumns(): TColDef<TTablePortfolioPVItem>[] {
    return [
        {
            field: 'pv',
            headerName: 'PV',
            filter: EColumnFilterType.number,
            valueFormatter: numberFormatter('%.4f'),
        },
        {
            field: 'portfolioPv',
            headerName: 'Portfolio PV',
            filter: EColumnFilterType.number,
            valueFormatter: numberFormatter('%.4f'),
        },
        {
            field: 'skewReserves',
            headerName: 'Skew Reserves',
            filter: EColumnFilterType.number,
            valueFormatter: numberFormatter('%.4f'),
        },
        {
            field: 'theta',
            headerName: 'Theta',
            filter: EColumnFilterType.number,
            valueFormatter: numberFormatter('%.4f'),
        },
        {
            field: 'thetaFx',
            headerName: 'Theta FX',
            filter: EColumnFilterType.number,
            valueFormatter: numberFormatter('%.4f'),
        },
    ];
}
