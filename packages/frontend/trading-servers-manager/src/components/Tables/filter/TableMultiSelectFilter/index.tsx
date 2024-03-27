import type { DefaultOptionType } from '@frontend/common/src/components/Select';
import { TableLabelSelect } from '@frontend/common/src/components/TableLabel/TableLabelSelect';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { isEqual, isNil, isNumber } from 'lodash-es';
import type { FilterFunc } from 'rc-select/lib/Select';
import { useMemo } from 'react';
import { usePrevious } from 'react-use';

import { cnExistingOption, cnSelectedOption } from './view.css.ts';

export const TableMultiSelectFilter = <
    TRow,
    TEntity,
    TEntityKey extends TEntity[keyof TEntity] & (string | number),
>({
    className,
    rows,
    selectEntries,
    values,
    placeHolder,
    setValues,
    getEntityKeyFromRow,
    getEntityKey,
    getEntityValue,
}: TWithClassname & {
    rows: TRow[] | undefined;
    selectEntries: TEntity[] | undefined;
    values: TEntityKey[];
    placeHolder: string;
    setValues: (values: TEntityKey[]) => void;
    getEntityKeyFromRow: (row: TRow) => TEntityKey;
    getEntityKey: (entity: TEntity) => TEntityKey;
    getEntityValue: (entity: TEntity) => string;
}) => {
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
            isNil(rawOptions) || (existingIds.size === 0 && values.length === 0)
                ? rawOptions
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

    const filterOption = useFunction(((
        input: string,
        option?: DefaultOptionType & { filterValue: string },
    ): boolean => {
        if (isNil(option)) {
            return false;
        }

        return option.filterValue.toUpperCase().includes(input.toUpperCase());
    }) as FilterFunc<DefaultOptionType>);

    return (
        <TableLabelSelect
            className={className}
            options={options}
            value={values}
            onChange={setValues}
            filterOption={filterOption}
            mode="multiple"
            maxTagCount="responsive"
            allowClear
            showSearch
            autoClearSearchValue
            placeholder={placeHolder}
        />
    );
};
