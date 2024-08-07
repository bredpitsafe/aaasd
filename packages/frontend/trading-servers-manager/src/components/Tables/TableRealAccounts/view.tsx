import { PlusOutlined } from '@ant-design/icons';
import type { ColDef } from '@frontend/ag-grid';
import { BOOLEAN_FILTER_VALUES } from '@frontend/ag-grid/src/filters';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { createTestProps } from '@frontend/common/e2e';
import { ERealAccountsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/real-accounts-tab/real-accounts.tab.selectors';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { DetailCellRenderer } from '@frontend/common/src/components/AgTable/DetailCellRenderer';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useRegExpTableFilter } from '@frontend/common/src/components/AgTable/hooks/useRegExpTableFilter';
import { TableLabelButton } from '@frontend/common/src/components/TableLabel/Button';
import { TableLabelRegExpFilter } from '@frontend/common/src/components/TableLabel/TableLabelRegExpFilter';
import { TableLabels } from '@frontend/common/src/components/TableLabel/TableLabels';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TRealAccount } from '@frontend/common/src/types/domain/account';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { getAccountsRowClassRules } from '../TableVirtualAccounts/utils';
import { cnRoot } from '../view.css';
import { useDetailCellRendererParams } from './details';
import { cnRowClassName } from './view.css';

type TTableRealAccountsViewProps = {
    realAccounts: TRealAccount[] | undefined;
    onEdit: (id?: TRealAccount['id'], clone?: boolean) => void;
};
export function TableRealAccountsView(props: TTableRealAccountsViewProps): ReactElement {
    const { realAccounts, onEdit } = props;

    const { gridApi, onGridReady } = useGridApi<TRealAccount>();

    const columns: ColDef<TRealAccount>[] = useMemo(
        () => [
            {
                field: 'id',
                headerName: 'ID',
                filter: EColumnFilterType.number,
                cellRenderer: 'agGroupCellRenderer',
                sort: 'asc',
            },
            {
                field: 'name',
                onCellDoubleClicked: (e) => onEdit(e.data?.id),
            },
            {
                field: 'exchangeAccountId',
                headerName: 'Exch. Acc. ID',
            },
            {
                field: 'isInternal',
                headerName: 'Internal',
                filter: EColumnFilterType.set,
                filterParams: {
                    ...BOOLEAN_FILTER_VALUES,
                },
            },
        ],
        [onEdit],
    );

    const detailCellRendererParams = useDetailCellRendererParams(ETableIds.RealAccountsNested);

    const {
        regExp,
        filterValid,
        templateExample,
        caseSensitive,
        toggleCaseSensitive,
        setRegExp,
        isExternalFilterPresent,
        doesExternalFilterPass,
    } = useRegExpTableFilter({
        tableId: ETableIds.RealAccountsNested,
        columns,
        gridApi,
        getDetailRowData: detailCellRendererParams.getDetailRowData,
        nestedColumns: detailCellRendererParams.detailGridOptions.columnDefs!,
    });

    const cbOpenNewAccountModal = useFunction(() => onEdit());

    const rowClassRules = useMemo(() => getAccountsRowClassRules<TRealAccount>(), []);

    return (
        <div className={cnRoot}>
            <TableLabels>
                <TableLabelRegExpFilter
                    inputPlaceholder={templateExample}
                    inputValue={regExp}
                    inputValid={filterValid}
                    onInputChange={setRegExp}
                    caseSensitive={caseSensitive}
                    onCaseSensitiveToggle={toggleCaseSensitive}
                />
                <TableLabelButton
                    icon={<PlusOutlined />}
                    {...createTestProps(ERealAccountsTabSelectors.NewRealAccountButton)}
                    title="Add new real account"
                    onClick={cbOpenNewAccountModal}
                >
                    New real acc.
                </TableLabelButton>
            </TableLabels>
            <AgTableWithRouterSync<TRealAccount>
                id={ETableIds.VirtualAccounts}
                rowKey="id"
                rowData={realAccounts}
                rowClass={cnRowClassName}
                columnDefs={columns}
                rowSelection="multiple"
                masterDetail
                detailCellRendererParams={detailCellRendererParams}
                detailCellRenderer={DetailCellRenderer}
                rowClassRules={rowClassRules}
                onGridReady={onGridReady}
                isExternalFilterPresent={isExternalFilterPresent}
                doesExternalFilterPass={doesExternalFilterPass}
            />
        </div>
    );
}
