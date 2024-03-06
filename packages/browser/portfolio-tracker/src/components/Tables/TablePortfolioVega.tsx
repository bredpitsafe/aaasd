import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { numberFormatter } from '@frontend/common/src/components/AgTable/formatters/number';
import type { TColDef } from '@frontend/common/src/components/AgTable/types';
import { EColumnFilterType } from '@frontend/common/src/components/AgTable/types';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { TAsset, TAssetId } from '@frontend/common/src/types/domain/asset';
import {
    EGreekByPeriodName,
    GREEK_BY_PERIOD_NAMES,
} from '@frontend/common/src/types/domain/portfolioTraсker';
import { isNil } from 'lodash-es';
import { ReactElement, useMemo } from 'react';

import { getDoubleAssetName } from './utils';

export type TTablePortfolioVegaItem = {
    id: string;
    total: number;
    assetId: TAssetId;
    baseAssetId: TAssetId;
    values: Record<EGreekByPeriodName, number>;
};

type TTablePortfolioVegaProps = TWithClassname & {
    assetsRecord: undefined | Record<TAssetId, TAsset>;
    items: undefined | TTablePortfolioVegaItem[];
};

export function TablePortfolioVega(props: TTablePortfolioVegaProps): ReactElement {
    const columns = useMemo<TColDef<TTablePortfolioVegaItem>[]>(
        () => getColumns(props.assetsRecord),
        [props.assetsRecord],
    );

    return (
        <div className={props.className}>
            <AgTableWithRouterSync<TTablePortfolioVegaItem>
                id={ETableIds.PortfolioVega}
                rowKey="id"
                rowData={props.items}
                columnDefs={columns}
                asyncTransactionWaitMillis={1000}
                suppressAnimationFrame={false}
            />
        </div>
    );
}

function getColumns(
    assetsRecord: undefined | Record<TAssetId, TAsset>,
): TColDef<TTablePortfolioVegaItem>[] {
    return [
        {
            colId: 'name',
            headerName: 'Name',
            filter: EColumnFilterType.text,
            valueGetter: (params) => {
                return (
                    !isNil(params.data) &&
                    getDoubleAssetName(assetsRecord, params.data.baseAssetId, params.data.assetId)
                );
            },
        },
        ...(GREEK_BY_PERIOD_NAMES.map((name) => ({
            colId: name,
            headerName: name,
            filter: EColumnFilterType.number,
            valueGetter: (params) => params.data?.values[name],
            valueFormatter: numberFormatter('%.4f'),
        })) as TColDef<TTablePortfolioVegaItem>[]),
        {
            field: 'total',
            headerName: 'Total',
            filter: EColumnFilterType.number,
            valueFormatter: numberFormatter('%.4f'),
        },
    ];
}
