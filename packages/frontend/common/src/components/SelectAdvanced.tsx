import type { DefaultOptionType } from 'antd/lib/select';
import { isEmpty, isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import type React from 'react';
import { isValidElement, useMemo, useState } from 'react';

import { useFunction } from '../utils/React/useFunction';
import type { OptionProps, SelectProps, SelectValue } from './Select';
import { Select } from './Select';

export type TSelectAdvancedProps<T> = SelectProps<T> & {
    exactSearchMatch?: boolean;
    sort?: boolean;
};

/* Extends standard Select component with the following features:
 * 1. Dropdown opens on focus.
 * 2. Values in the dropdown are sorted in Lexicographical order.
 * 2. Field value is set on blur if the dropdown consists of a single line.
 * 3. Field value is set on blur if filter input *exactly* matches one of the values.
 * 4. Search value matches value from the start of the string
 * */
export function SelectAdvanced<T extends SelectValue = SelectValue>(
    props: TSelectAdvancedProps<T>,
): ReactElement {
    const {
        exactSearchMatch = true,
        onChange,
        onSelect,
        onBlur,
        onSearch,
        children,
        optionFilterProp = 'children',
        sort = true,
        ...restProps
    } = props;
    const [searchInput, setSearchInput] = useState('');

    const cbFilterSort = useFunction(
        (optionA: DefaultOptionType, optionB: DefaultOptionType): number =>
            optionA.value! > optionB.value! ? 1 : -1,
    );

    const cbFilterOption: SelectProps['filterOption'] = useFunction((inputValue, option) => {
        const value = option ? option[optionFilterProp] : undefined;
        return isEmpty(value)
            ? false
            : String(value).toLowerCase().startsWith(inputValue.toLowerCase());
    });

    const postSelectOption = useMemo<OptionProps | null>(() => {
        if (isNil(children)) {
            return null;
        }

        const optionValues = (Array.isArray(children) ? children : [children])
            .filter((element) => isValidElement(element))
            .map((element) => element.props as OptionProps)
            .filter((props) => !isNil(props.value));

        // Save the option to fill the select on blur in the following cases:
        // 1. This is the only option available
        // 2. Option value matches the input value.
        if (optionValues.length === 1) {
            return optionValues[0];
        }

        const foundItems = optionValues.filter(({ value }) =>
            String(value).toLowerCase().startsWith(searchInput.toLowerCase()),
        );

        if (foundItems.length === 1) {
            return foundItems[0];
        }

        return null;
    }, [children, searchInput]);

    const cbBlur: React.FocusEventHandler<HTMLElement> = useFunction((event) => {
        if (!isNil(postSelectOption)) {
            const value = (
                restProps.mode === 'multiple' ? [postSelectOption.value] : postSelectOption.value
            ) as T;

            // @ts-ignore
            onChange?.(value, postSelectOption);
            // @ts-ignore
            onSelect?.(postSelectOption.value, postSelectOption);
        }

        onBlur && onBlur(event);
    });

    const cbSearch = useFunction((inputValue: string) => {
        setSearchInput(inputValue);
        onSearch?.(inputValue);
    });

    return (
        <Select
            showAction={['focus', 'click']}
            optionFilterProp={optionFilterProp}
            filterSort={sort ? cbFilterSort : undefined}
            filterOption={exactSearchMatch ? cbFilterOption : undefined}
            autoClearSearchValue={false}
            onBlur={cbBlur}
            onChange={onChange}
            onSelect={onSelect}
            onSearch={props.showSearch ? cbSearch : undefined}
            {...restProps}
        >
            {children}
        </Select>
    );
}
