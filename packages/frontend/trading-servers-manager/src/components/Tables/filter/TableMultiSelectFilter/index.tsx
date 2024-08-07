import { WarningOutlined } from '@ant-design/icons';
import { pickTestProps } from '@frontend/common/e2e';
import {
    ETradingServersManagerSelectors,
    TradingServersManagerProps,
} from '@frontend/common/e2e/selectors/trading-servers-manager/trading-servers-manager.page.selectors';
import type { DefaultOptionType } from '@frontend/common/src/components/Select';
import { TableLabelSelect } from '@frontend/common/src/components/TableLabel/TableLabelSelect';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState.ts';
import cn from 'classnames';
import { isEqual, isNil, isNumber, xor } from 'lodash-es';
import { useMemo, useRef, useState } from 'react';
import { usePrevious } from 'react-use';

import { SelectDropdown } from './components/SelectDropdown.tsx';
import { cnExistingOption, cnSelectContainer, cnSelectedOption, cnWarnIcon } from './view.css.ts';

const DEBOUNCE_TIME = 1000;

type TTableMultiSelectFilterProps<
    TRow,
    TEntity,
    TEntityKey extends TEntity[keyof TEntity] & (string | number),
> = TWithClassname & {
    rows: TRow[] | undefined;
    selectEntries: TEntity[] | undefined;
    values: TEntityKey[];
    placeHolder: string;
    setValues: (values: TEntityKey[]) => void;
    getEntityKeyFromRow: (row: TRow) => TEntityKey;
    getEntityKey: (entity: TEntity) => TEntityKey;
    getEntityValue: (entity: TEntity) => string;
};

export const TableMultiSelectFilter = <
    TRow,
    TEntity,
    TEntityKey extends TEntity[keyof TEntity] & (string | number),
>(
    props: TTableMultiSelectFilterProps<TRow, TEntity, TEntityKey>,
) => {
    const {
        className,
        rows,
        selectEntries,
        values,
        placeHolder,
        setValues,
        getEntityKeyFromRow,
        getEntityKey,
        getEntityValue,
    } = props;

    const rawExistingIds = useMemo(
        () => new Set(rows?.map(getEntityKeyFromRow)),
        [rows, getEntityKeyFromRow],
    );
    const previousExistingIds = usePrevious(rawExistingIds);

    const existingIds = useMemo(
        () =>
            !isNil(previousExistingIds) && isEqual(rawExistingIds, previousExistingIds)
                ? previousExistingIds
                : rawExistingIds,
        [previousExistingIds, rawExistingIds],
    );

    const rawOptions = useMemo(
        () =>
            isNil(selectEntries)
                ? undefined
                : [...selectEntries]
                      .sort((left, right) => {
                          const leftKey = getEntityKey(left);
                          const rightKey = getEntityKey(right);

                          return isNumber(leftKey) && isNumber(rightKey)
                              ? leftKey - rightKey
                              : leftKey.toString().localeCompare(rightKey.toString());
                      })
                      .map((entity) => {
                          const label = getEntityValue(entity);
                          const entityId = getEntityKey(entity);

                          return {
                              value: entityId,
                              label,
                              filterValue: label,
                          } as DefaultOptionType;
                      }),
        [getEntityKey, getEntityValue, selectEntries],
    );

    const options = useMemo(
        () =>
            isNil(rawOptions)
                ? undefined
                : rawOptions
                      .filter(
                          ({ value }) =>
                              existingIds.has(value as TEntityKey) ||
                              values.includes(value as TEntityKey),
                      )
                      .map(
                          (option) =>
                              ({
                                  ...option,
                                  className: cn({
                                      [cnSelectedOption]: values.includes(
                                          option.value as TEntityKey,
                                      ),
                                      [cnExistingOption]: existingIds.has(
                                          option.value as TEntityKey,
                                      ),
                                  }),
                              }) as DefaultOptionType,
                      )
                      .concat(
                          rawOptions.filter(
                              ({ value }) =>
                                  !existingIds.has(value as TEntityKey) &&
                                  !values.includes(value as TEntityKey),
                          ),
                      ),
        [rawOptions, existingIds, values],
    );

    const [isDropdownOpened, setIsDropdownOpened] = useState(false);

    const [filteredOptions, setFilteredOptions] = useSyncState(options, [options]);
    const [searchText, setSearchText] = useState('');
    const [checkedValues, setCheckedValues] = useSyncState<Array<string | number>>(values, [
        values,
    ]);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = useFunction((value: string) => {
        setSearchText(value);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            const filtered = (
                options as Array<DefaultOptionType & { filterValue: string }>
            )?.filter((option: DefaultOptionType & { filterValue: string }) => {
                const pattern = new RegExp(value, 'i');
                return pattern.test(option.filterValue);
            });
            setFilteredOptions(filtered);
        }, DEBOUNCE_TIME);
    });

    const isAllFilteredOptionsChecked = useMemo(
        () =>
            !isNil(filteredOptions) &&
            filteredOptions?.every((val) => {
                if (!isNil(val.value)) {
                    return checkedValues.includes(val.value);
                }
                return false;
            }),
        [checkedValues, filteredOptions],
    );

    const setAllFilteredOptionsToChecked = useFunction(() => {
        const allFilteredValueIds =
            filteredOptions?.reduce<Array<string | number>>((acc, curOption) => {
                if (!isNil(curOption.value)) {
                    acc.push(curOption.value);
                }
                return acc;
            }, []) ?? [];
        setCheckedValues(allFilteredValueIds);
    });

    const selectOrDeselectAll = useFunction(() => {
        isAllFilteredOptionsChecked ? setCheckedValues([]) : setAllFilteredOptionsToChecked();
    });

    const handleApply = useFunction(() => setValues(checkedValues as TEntityKey[]));

    const handleReset = useFunction(() => setValues([]));

    const handleResetFilter = useFunction(() => {
        if (!hasDraftChecked) {
            setValues([]);
        } else {
            setCheckedValues(values);
        }
    });

    const handleDeselect = useFunction((v) => {
        if (!isDropdownOpened) {
            setValues(checkedValues.filter((checked) => checked !== v) as TEntityKey[]);
        }
    });

    const hasDraftChecked = useMemo(() => {
        const xorValues = xor(values, checkedValues);
        return checkedValues.length > 0 && xorValues.length > 0;
    }, [values, checkedValues]);

    return (
        <div className={cn(cnSelectContainer, className)} {...pickTestProps(props)}>
            <TableLabelSelect
                {...TradingServersManagerProps[ETradingServersManagerSelectors.SelectorFilter]}
                options={filteredOptions}
                dropdownRender={(originalNode) => (
                    <SelectDropdown
                        originalNode={originalNode}
                        selectOrDeselectAll={selectOrDeselectAll}
                        checkedValuesLength={checkedValues?.length || 0}
                        filteredOptionsLength={filteredOptions?.length || 0}
                        isAllFilteredOptionsChecked={isAllFilteredOptionsChecked}
                        handleApply={handleApply}
                        handleReset={handleResetFilter}
                    />
                )}
                value={checkedValues}
                onChange={setCheckedValues}
                filterOption={false}
                onSearch={handleSearch}
                mode="multiple"
                maxTagCount="responsive"
                allowClear
                showSearch
                searchValue={searchText}
                autoClearSearchValue={false}
                placeholder={placeHolder}
                onDeselect={handleDeselect}
                onDropdownVisibleChange={setIsDropdownOpened}
                onClear={handleReset}
                status={hasDraftChecked && !isDropdownOpened ? 'warning' : ''}
            />
            {hasDraftChecked && !isDropdownOpened && (
                <WarningOutlined title="The filter is not applied" className={cnWarnIcon} />
            )}
        </div>
    );
};
