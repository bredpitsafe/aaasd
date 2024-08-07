import type { RowClassParams } from '@frontend/ag-grid';
import type { TStmBalanceRow } from '@frontend/common/src/components/hooks/useStmBalances';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { cnBalanceEvenRow } from '../view.css';

export function useRowClassRules() {
    return useMemo(() => {
        let viewPort:
            | {
                  firstRowIndex: number;
                  lastRowIndex: number;
                  rowTypes: {
                      rowIndex: number;
                      isOdd: boolean;
                      groupKey: string | undefined;
                  }[];
              }
            | undefined = undefined;

        return {
            [cnBalanceEvenRow]: ({ api, rowIndex, data }: RowClassParams<TStmBalanceRow>) => {
                if (isNil(data)) {
                    return false;
                }

                const firstRowIndex = api.getFirstDisplayedRow();
                const lastRowIndex = api.getLastDisplayedRow();

                const commonRowIndex = Math.max(firstRowIndex, viewPort?.firstRowIndex ?? 0);
                const commonRow = viewPort?.rowTypes.find((row) => row.rowIndex === commonRowIndex);

                const rows: {
                    rowIndex: number;
                    isOdd: boolean;
                    groupKey: string | undefined;
                }[] = [];

                let guessedRowTypes = true;
                let isOdd = true;
                let groupKey: string | undefined = undefined;

                for (let rowIndex = firstRowIndex; rowIndex <= lastRowIndex; rowIndex++) {
                    const currentGroupKey = api.getDisplayedRowAtIndex(rowIndex)?.data?.groupKey;

                    if (currentGroupKey !== groupKey) {
                        isOdd = !isOdd;
                        groupKey = currentGroupKey;
                    }

                    rows.push({ rowIndex, isOdd, groupKey });

                    if (
                        !isNil(commonRow) &&
                        commonRow.rowIndex === rowIndex &&
                        commonRow.isOdd !== isOdd
                    ) {
                        guessedRowTypes = false;
                    }
                }

                viewPort = {
                    firstRowIndex,
                    lastRowIndex,
                    rowTypes: rows.map((row) => ({
                        ...row,
                        isOdd: guessedRowTypes ? row.isOdd : !row.isOdd,
                    })),
                };

                return viewPort.rowTypes.find((row) => row.rowIndex === rowIndex)?.isOdd ?? false;
            },
        };
    }, []);
}
