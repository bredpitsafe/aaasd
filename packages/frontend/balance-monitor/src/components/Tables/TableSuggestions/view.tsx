import type { IRowNode } from '@frontend/ag-grid';
import {
    ESuggestedTransfersTabSelectors,
    SuggestedTransfersTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/suggested-transfers/suggested-transfers.tab.selectors';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useFilteredData } from '@frontend/common/src/components/AgTable/hooks/useFilteredData';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import {
    EAgGridOverlay,
    useGridOverlay,
} from '@frontend/common/src/components/AgTable/hooks/useGridOverlay';
import { useRegExpTableFilter } from '@frontend/common/src/components/AgTable/hooks/useRegExpTableFilter';
import { useRowSelection } from '@frontend/common/src/components/AgTable/hooks/useRowSelection';
import { useTransactionArrayUpdate } from '@frontend/common/src/components/AgTable/hooks/useTransactionUpdate';
import { TableLabelCount } from '@frontend/common/src/components/TableLabel/Count';
import { TableLabelExportData } from '@frontend/common/src/components/TableLabel/TableLabelExportData';
import { TableLabelRegExpFilter } from '@frontend/common/src/components/TableLabel/TableLabelRegExpFilter';
import { TableLabels } from '@frontend/common/src/components/TableLabel/TableLabels';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
    isWaitingArgumentsValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, isEqual, isNil } from 'lodash-es';
import { memo, useMemo, useState } from 'react';

import type { TCoinInfoDescriptor } from '../../../modules/actions/ModuleSubscribeToCoinInfoOnCurrentStage.ts';
import type { TConvertRatesDescriptor } from '../../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import type { TSuggestionsDescriptor } from '../../../modules/actions/ModuleSubscribeToCurrentSuggestions.ts';
import type { TManualTransferFormData } from '../../Forms/ManualTransfer/defs';
import { DEFAULT_ROW_HEIGHT } from '../defs';
import { useGridCoinFilter } from '../hooks/useGridCoinFilter';
import { cnBalanceMonitorTable, cnRoot } from '../style.css';
import { DirtyKeysContext } from './components/DirtyKeysContext';
import type { TPlainSuggestion } from './defs';
import { useColumns } from './hooks/useColumn';
import { useGetContextMenuItems } from './hooks/useGetContextMenuItems';
import { useGetCSVOptions } from './hooks/useGetCSVOptions';
import { usePlainSuggestions } from './hooks/usePlainSuggestions';
import { initialGroupOrderComparator, ROW_CLASS_RULES } from './utils';

export const TableSuggestions = memo(
    ({
        coin,
        suggestionsDescriptor,
        coinInfoDescriptor,
        convertRatesDescriptor,
        onOpenManualTransferTab,
        onSaveCoinState,
    }: {
        coin?: TCoinId;
        suggestionsDescriptor: TSuggestionsDescriptor;
        coinInfoDescriptor: TCoinInfoDescriptor;
        convertRatesDescriptor: TConvertRatesDescriptor;
        onOpenManualTransferTab: (manualTransfer?: TManualTransferFormData) => void;
        onSaveCoinState: (coin: TCoinId, comment: string) => void;
    }) => {
        const { gridApi, onGridReady } = useGridApi<TPlainSuggestion>();

        const [dirtyKeysSet, setDirtyKeysSet] = useState(() => new Set<string>());

        const columns = useColumns(
            coin,
            useFunction((key: string) =>
                setDirtyKeysSet((dirtyKeysSet) => {
                    const newDirtyKeysSet = new Set(dirtyKeysSet);
                    newDirtyKeysSet.add(key);
                    return newDirtyKeysSet;
                }),
            ),
        );
        const getCSVOptions = useGetCSVOptions();

        const {
            regExp,
            filterValid,
            templateExample,
            caseSensitive,
            toggleCaseSensitive,
            setRegExp,
            isExternalFilterPresent: isRegExpFilterPresent,
            doesExternalFilterPass: doesRegExpFilterPass,
        } = useRegExpTableFilter({
            tableId: ETableIds.Suggestions,
            columns,
            gridApi,
        });

        const { getFilteredData, filteredCount } = useFilteredData(gridApi);
        const { onSelectionChanged, selectedRows } = useRowSelection<TPlainSuggestion>();

        const plainSuggestionsDescriptor = usePlainSuggestions(
            suggestionsDescriptor,
            coinInfoDescriptor,
            convertRatesDescriptor,
        );

        const plainSuggestions = useMemo(
            () =>
                isSyncedValueDescriptor(plainSuggestionsDescriptor)
                    ? plainSuggestionsDescriptor.value
                    : undefined,
            [plainSuggestionsDescriptor],
        );

        useTransactionArrayUpdate<TPlainSuggestion, 'key'>(
            gridApi,
            'key',
            plainSuggestions,
            useFunction(
                (prevItem, nextItem): boolean =>
                    dirtyKeysSet.has(nextItem.key) || isEqual(prevItem, nextItem),
            ),
            {
                onDelete: useFunction((keys: string[]) =>
                    setDirtyKeysSet((dirtyKeysSet) => {
                        const newDirtyKeysSet = new Set(dirtyKeysSet);
                        keys.forEach((key) => newDirtyKeysSet.delete(key));
                        return newDirtyKeysSet;
                    }),
                ),
            },
        );

        const getContextMenuItems = useGetContextMenuItems(
            onOpenManualTransferTab,
            onSaveCoinState,
        );

        const resetRowDirtyState = useFunction((key: string) => {
            setDirtyKeysSet((dirtyKeysSet) => {
                const newDirtyKeysSet = new Set(dirtyKeysSet);
                newDirtyKeysSet.delete(key);
                return newDirtyKeysSet;
            });

            if (isNil(gridApi)) {
                return;
            }

            const data = gridApi.getRowNode(key)?.data;

            if (isNil(data)) {
                return;
            }

            gridApi.applyTransaction({
                update: [
                    {
                        ...data,
                        ...data.original,
                    },
                ],
            });
        });

        const dirtyKeysContext = useMemo(
            () => ({
                dirtyKeysSet,
                resetRowEdited: resetRowDirtyState,
            }),
            [dirtyKeysSet, resetRowDirtyState],
        );

        useGridOverlay(
            gridApi,
            isLoadingValueDescriptor(plainSuggestionsDescriptor) ||
                isWaitingArgumentsValueDescriptor(plainSuggestionsDescriptor)
                ? EAgGridOverlay.loading
                : isEmpty(plainSuggestionsDescriptor.value)
                  ? EAgGridOverlay.empty
                  : EAgGridOverlay.none,
        );

        const {
            isExternalFilterPresent: isCoinFilterPresent,
            doesExternalFilterPass: doesCoinFilterPass,
        } = useGridCoinFilter<TPlainSuggestion>(gridApi, coin);

        const isExternalFilterPresent = useFunction(
            () => isCoinFilterPresent() || isRegExpFilterPresent(),
        );

        const doesExternalFilterPass = useFunction(
            (node: IRowNode<TPlainSuggestion>) =>
                doesRegExpFilterPass(node) && doesCoinFilterPass(node),
        );

        return (
            <div
                {...SuggestedTransfersTabProps[
                    ESuggestedTransfersTabSelectors.SuggestedTransfersTab
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
                    <TableLabelCount
                        title="Transfers"
                        count={plainSuggestions?.length}
                        filteredCount={filteredCount}
                    />
                    <TableLabelExportData
                        selectedRows={selectedRows}
                        getData={getFilteredData}
                        filename="suggestions"
                        getOptions={getCSVOptions}
                    />
                </TableLabels>
                <DirtyKeysContext.Provider value={dirtyKeysContext}>
                    <AgTableWithRouterSync
                        className={cnBalanceMonitorTable}
                        id={ETableIds.Suggestions}
                        rowKey="key"
                        columnDefs={columns}
                        rowSelection="multiple"
                        onSelectionChanged={onSelectionChanged}
                        onGridReady={onGridReady}
                        isExternalFilterPresent={isExternalFilterPresent}
                        doesExternalFilterPass={doesExternalFilterPass}
                        groupDefaultExpanded={-1}
                        rowClassRules={ROW_CLASS_RULES}
                        initialGroupOrderComparator={initialGroupOrderComparator}
                        groupDisplayType="groupRows"
                        rowHeight={DEFAULT_ROW_HEIGHT}
                        getContextMenuItems={getContextMenuItems}
                        floatingFiltersHeight={30}
                        stopEditingWhenCellsLoseFocus
                        rowGroupPanelShow="never"
                    />
                </DirtyKeysContext.Provider>
            </div>
        );
    },
);
