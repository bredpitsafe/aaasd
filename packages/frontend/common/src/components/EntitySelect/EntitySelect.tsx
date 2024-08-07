import type { DefaultOptionType } from 'antd/lib/select';
import cn from 'classnames';
import type { FilterFunc } from 'rc-select/lib/Select';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';

import type { TWithClassname } from '../../types/components';
import { cyrillicToLatin } from '../../utils/cyrillicToLatin.ts';
import { useFunction } from '../../utils/React/useFunction';
import { Button } from '../Button';
import { FloatButton } from '../FloatButton';
import { Select } from '../Select';
import { cnFakeButton, cnSelect, cnWrapper } from './EntitySelect.css.ts';

type TSelectProps<T> = Omit<ComponentProps<typeof Select<T>>, 'onChange' | 'open' | 'showSearch'>;

export type TEntitySelectProps<T> = TWithClassname &
    Omit<TSelectProps<T>, 'onChange' | 'open' | 'showSearch'> & {
        onChange: (name: T) => void;
        icon?: ReactNode;
        type: 'icon-label' | 'icon' | 'float';
        closable?: boolean;
    };

export const EntitySelect = <T,>(props: TEntitySelectProps<T>) => {
    const {
        className,
        type,
        bordered,
        closable = true,
        showArrow = false,
        value,
        icon,
        placeholder,
        ...selectProps
    } = props;
    const [isHover, setIsHover] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(props.defaultOpen ?? false);
    const isActive = isHover || isFocused;
    const isIconLabel = type === 'icon-label';
    const isCompactLabel = type === 'float' || type === 'icon';

    const ButtonComponent = type === 'float' ? FloatButton : Button;

    const handleFocus = useFunction((event) => {
        props.onFocus?.(event);
        setIsFocused(true);
    });
    const handleBlur = useFunction((event) => {
        props.onBlur?.(event);
        closable && setIsFocused(false);
    });
    const handleMouseEnter = useFunction((event) => {
        props.onMouseEnter?.(event);
        setIsHover(true);
    });
    const handleMouseLeave = useFunction((event) => {
        props.onMouseLeave?.(event);
        setIsHover(false);
    });
    const handleDropdownVisibleChange = useFunction((dropdownVisible: boolean) => {
        props.onDropdownVisibleChange?.(dropdownVisible);
        setIsFocused(closable ? dropdownVisible : true);
    });

    const handleFilterOption: FilterFunc<DefaultOptionType> = useFunction(
        (filter, option) => String(option?.value).includes(cyrillicToLatin(filter)) ?? false,
    );

    const selectElement = (
        <Select
            {...selectProps}
            open={isFocused}
            value={value}
            showSearch
            showArrow={showArrow}
            className={cn(isIconLabel && className, {
                [cnSelect.static]: isIconLabel,
                [cnSelect.idle]: isCompactLabel && !isActive,
                [cnSelect.active]: isCompactLabel && isActive,
            })}
            placeholder={isIconLabel ? placeholder : undefined}
            onFocus={handleFocus}
            onMouseEnter={handleMouseEnter}
            onBlur={handleBlur}
            onMouseLeave={handleMouseLeave}
            onDropdownVisibleChange={handleDropdownVisibleChange}
            dropdownMatchSelectWidth={false}
            filterOption={handleFilterOption}
        />
    );

    if (isIconLabel) {
        return selectElement;
    }

    return (
        <div className={cnWrapper}>
            <ButtonComponent
                size={props.size}
                icon={icon}
                className={cnFakeButton}
                tabIndex={-1}
                type={type === 'float' ? undefined : bordered === false ? 'default' : undefined}
            />
            {selectElement}
        </div>
    );
};
