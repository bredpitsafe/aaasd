import { MoneyCollectOutlined, RedoOutlined } from '@ant-design/icons';
import {
    CoinTransferDetailsTabProps,
    ECoinTransferDetailsTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/coin-transfer-details/coin-transfer-details.tab.selectors';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useFilteredData } from '@frontend/common/src/components/AgTable/hooks/useFilteredData';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useRegExpTableFilter } from '@frontend/common/src/components/AgTable/hooks/useRegExpTableFilter';
import { useRowSelection } from '@frontend/common/src/components/AgTable/hooks/useRowSelection';
import { TableLabelButton } from '@frontend/common/src/components/TableLabel/Button';
import { TableLabelCount } from '@frontend/common/src/components/TableLabel/Count';
import { TableLabelExportData } from '@frontend/common/src/components/TableLabel/TableLabelExportData';
import { TableLabelRegExpFilter } from '@frontend/common/src/components/TableLabel/TableLabelRegExpFilter';
import { TableLabels } from '@frontend/common/src/components/TableLabel/TableLabels';
import { TableLabelSelect } from '@frontend/common/src/components/TableLabel/TableLabelSelect';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import {
    isFailValueDescriptor,
    isSyncedValueDescriptor,
    matchValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import cn from 'classnames';
import { isUndefined } from 'lodash-es';
import { memo, useMemo } from 'react';

import type { TCoinTransferDetailsDescriptor } from '../../../modules/actions/ModuleCoinTransferDetails.ts';
import type { TCoinInfoDescriptor } from '../../../modules/actions/ModuleSubscribeToCoinInfoOnCurrentStage.ts';
import type { TConvertRatesDescriptor } from '../../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import { CoinWithIcon } from '../../CoinWithIcon';
import { DEFAULT_FILTER_OPTION } from '../../utils';
import { DEFAULT_ROW_HEIGHT } from '../defs';
import { cnBalanceMonitorTable, cnRoot } from '../style.css';
import type { TCoinTransferDetailsWithId } from './defs';
import { useColumns } from './hooks/useColumn';
import { useGetCSVOptions } from './hooks/useGetCSVOptions';
import { cnCoinSelector, cnCoinSelectorEmpty } from './view.css';

export const TableCoinTransferDetails = memo(
    ({
        coinTransferDetailsDescriptor,
        coinInfoDescriptor,
        convertRatesDescriptor,
        refreshCoinTransferDetails,
        selectedCoin,
        onSelectCoin,
    }: {
        coinTransferDetailsDescriptor: TCoinTransferDetailsDescriptor;
        coinInfoDescriptor: TCoinInfoDescriptor;
        convertRatesDescriptor: TConvertRatesDescriptor;
        refreshCoinTransferDetails: (coin: TCoinId) => void;
        selectedCoin: TCoinId | undefined;
        onSelectCoin: (coin: TCoinId | undefined) => void;
    }) => {
        const columns = useColumns();
        const getCSVOptions = useGetCSVOptions();

        const { gridApi, onGridReady } = useGridApi<TCoinTransferDetailsWithId>();

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
            tableId: ETableIds.CoinTransferDetails,
            columns,
            gridApi,
        });

        const { getFilteredData, filteredCount } = useFilteredData(gridApi);
        const { onSelectionChanged, selectedRows } = useRowSelection<TCoinTransferDetailsWithId>();

        const coinTransferDetails = useMemo(
            () =>
                isUndefined(selectedCoin)
                    ? EMPTY_ARRAY
                    : matchValueDescriptor(coinTransferDetailsDescriptor, {
                          unsynced(vd) {
                              return isFailValueDescriptor(vd) ? EMPTY_ARRAY : undefined;
                          },
                          synced({ value }): TCoinTransferDetailsWithId[] {
                              return value.map((details) => ({
                                  rowId: `COIN: ${details.coin} SOURCE: ${details.source.account} DESTINATION: ${details.destination.account} NETWORK: ${details.network}`,
                                  ...details,
                                  convertRate: isSyncedValueDescriptor(convertRatesDescriptor)
                                      ? convertRatesDescriptor.value.get(details.coin)
                                      : undefined,
                              }));
                          },
                      }),
            [coinTransferDetailsDescriptor, convertRatesDescriptor, selectedCoin],
        );

        const items = useMemo(
            () =>
                isSyncedValueDescriptor(coinInfoDescriptor)
                    ? (Array.from(coinInfoDescriptor.value.keys()) as TCoinId[])
                          .sort()
                          .map((coin) => ({
                              value: coin,
                              label: <CoinWithIcon coin={coin} />,
                          }))
                    : undefined,
            [coinInfoDescriptor],
        );

        const cbRefreshCoinTransferDetails = useFunction(() => {
            if (selectedCoin === undefined) {
                return;
            }

            refreshCoinTransferDetails(selectedCoin);
        });

        return (
            <div
                {...CoinTransferDetailsTabProps[
                    ECoinTransferDetailsTabSelectors.CoinTransferDetailsTab
                ]}
                className={cnRoot}
            >
                <TableLabels>
                    <TableLabelRegExpFilter
                        inputPlaceholder={templateExample}
                        inputValue={regExp}
                        inputValid={filterValid}
                        onInputChange={setRegExp}
                        caseSensitive={caseSensitive}
                        onCaseSensitiveToggle={toggleCaseSensitive}
                    />
                    <TableLabelSelect
                        {...CoinTransferDetailsTabProps[
                            ECoinTransferDetailsTabSelectors.CoinTransferFilter
                        ]}
                        className={cn(cnCoinSelector, {
                            [cnCoinSelectorEmpty]: selectedCoin === undefined,
                        })}
                        icon={<MoneyCollectOutlined />}
                        options={items}
                        value={selectedCoin}
                        onChange={onSelectCoin}
                        filterOption={DEFAULT_FILTER_OPTION}
                        showSearch
                    />
                    <TableLabelButton
                        {...CoinTransferDetailsTabProps[
                            ECoinTransferDetailsTabSelectors.CoinRefreshButton
                        ]}
                        icon={<RedoOutlined />}
                        title="Refresh"
                        onClick={cbRefreshCoinTransferDetails}
                        disabled={selectedCoin === undefined}
                    >
                        Refresh
                    </TableLabelButton>
                    <TableLabelCount
                        title="Details"
                        count={coinTransferDetails?.length}
                        filteredCount={filteredCount}
                    />
                    <TableLabelExportData
                        selectedRows={selectedRows}
                        getData={getFilteredData}
                        filename="suggestions"
                        getOptions={getCSVOptions}
                    />
                </TableLabels>
                <AgTableWithRouterSync
                    className={cnBalanceMonitorTable}
                    id={ETableIds.CoinTransferDetails}
                    rowKey="rowId"
                    rowData={coinTransferDetails}
                    columnDefs={columns}
                    rowSelection="multiple"
                    onSelectionChanged={onSelectionChanged}
                    onGridReady={onGridReady}
                    isExternalFilterPresent={isExternalFilterPresent}
                    doesExternalFilterPass={doesExternalFilterPass}
                    floatingFiltersHeight={30}
                    enableRangeSelection
                    rowHeight={DEFAULT_ROW_HEIGHT}
                />
            </div>
        );
    },
);
