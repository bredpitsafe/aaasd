import { Select } from 'antd';
import type {
    BaseOptionType,
    DefaultOptionType,
    OptionProps,
    RefSelectProps,
    SelectProps,
    SelectValue,
} from 'antd/lib/select';

export const Option = Select.Option;
export type SelectRef = RefSelectProps;
export { Select };
export type { SelectProps, OptionProps, SelectValue, BaseOptionType, DefaultOptionType };
