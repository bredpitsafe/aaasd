import { PlusOutlined } from '@ant-design/icons';
import { createTestProps } from '@frontend/common/e2e';
import { EVirtualAccountsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/virtual-accounts-tab/virtual-accounts.tab.selectors';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { DetailCellRenderer } from '@frontend/common/src/components/AgTable/DetailCellRenderer';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useRegExpTableFilter } from '@frontend/common/src/components/AgTable/hooks/useRegExpTableFilter';
import { EColumnFilterType } from '@frontend/common/src/components/AgTable/types';
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
import type { ColDef } from 'ag-grid-community';
import { ReactElement, useMemo } from 'react';

import { useDetailCellRendererParams } from './details';
import { getAccountsRowClassRules } from './utils';
import { cnRoot, cnRowClassName } from './view.css';

type TTableVirtualAccountsViewProps = {
    loading: boolean;
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
