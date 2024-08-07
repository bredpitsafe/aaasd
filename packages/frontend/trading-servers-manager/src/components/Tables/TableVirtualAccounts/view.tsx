import { PlusOutlined } from '@ant-design/icons';
import type { ColDef } from '@frontend/ag-grid';
import { BOOLEAN_FILTER_VALUES } from '@frontend/ag-grid/src/filters';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { createTestProps } from '@frontend/common/e2e';
import { EVirtualAccountsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/virtual-accounts-tab/virtual-accounts.tab.selectors';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { DetailCellRenderer } from '@frontend/common/src/components/AgTable/DetailCellRenderer';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useRegExpTableFilter } from '@frontend/common/src/components/AgTable/hooks/useRegExpTableFilter';
import { TableLabelButton } from '@frontend/common/src/components/TableLabel/Button';
import { TableLabelRegExpFilter } from '@frontend/common/src/components/TableLabel/TableLabelRegExpFilter';
import { TableLabels } from '@frontend/common/src/components/TableLabel/TableLabels';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type {
    TNestedVirtualAccount,
    TRealAccount,
    TVirtualAccount,
} from '@frontend/common/src/types/domain/account';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { cnRoot } from '../view.css';
import { useDetailCellRendererParams } from './details';
import { getAccountsRowClassRules } from './utils';
import { cnRowClassName } from './view.css';

type TTableVirtualAccountsViewProps = {
    accounts: TNestedVirtualAccount[] | undefined;
    onEdit: (id?: TVirtualAccount['id']) => void;
    onEditReal: (id?: TRealAccount['id']) => void;
};

export function TableVirtualAccountsView(props: TTableVirtualAccountsViewProps): ReactElement {
    const { accounts, onEdit, onEditReal } = props;

    const { gridApi, onGridReady } = useGridApi<TNestedVirtualAccount>();

    const columns: ColDef<TNestedVirtualAccount>[] = useMemo(
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
                headerName: 'Name',
                onCellDoubleClicked: (e) => onEdit(e.data?.id),
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

    const detailCellRendererParams = useDetailCellRendererParams(
        ETableIds.VirtualAccountsNested,
        onEditReal,
    );

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
        tableId: ETableIds.VirtualAccountsNested,
        columns,
        gridApi,
        getDetailRowData: detailCellRendererParams.getDetailRowData,
        nestedColumns: detailCellRendererParams.detailGridOptions.columnDefs!,
    });

    const cbOpenNewAccountModal = useFunction(() => onEdit());

    const rowClassRules = useMemo(() => getAccountsRowClassRules<TNestedVirtualAccount>(), []);

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
                    {...createTestProps(EVirtualAccountsTabSelectors.NewVirtualAccountButton)}
                    icon={<PlusOutlined />}
                    title="Add new virtual account"
                    onClick={cbOpenNewAccountModal}
                >
                    New virt. acc.
                </TableLabelButton>
            </TableLabels>
            <AgTableWithRouterSync<TNestedVirtualAccount>
                id={ETableIds.VirtualAccounts}
                rowKey="id"
                rowData={accounts}
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
