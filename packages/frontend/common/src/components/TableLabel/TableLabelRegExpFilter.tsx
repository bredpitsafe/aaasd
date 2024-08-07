import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ReactElement } from 'react';

import {
    ETableTabFilterProps,
    ETableTabFilterSelectors,
} from '../../../e2e/selectors/table-tab.filter.selectors';
import { Switch } from '../Switch';
import { cnRegexpInput } from './style.css';
import type { TTableLabelInputProps } from './TableLabelInput';
import { TableLabelInput } from './TableLabelInput';
import type { TTableLabelSwitchProps } from './TableLabelSwitch';

type TTableLabelRegExpFilterProps = {
    inputValid?: boolean;
    inputValue?: TTableLabelInputProps['value'];
    inputPlaceholder?: TTableLabelInputProps['placeholder'];
    caseSensitive?: TTableLabelSwitchProps['enabled'];

    onInputChange: TTableLabelInputProps['onValueChange'];
    onCaseSensitiveToggle?: TTableLabelSwitchProps['onToggle'];
};

export function TableLabelRegExpFilter(props: TTableLabelRegExpFilterProps): ReactElement {
    return (
        <TableLabelInput
            {...ETableTabFilterProps[ETableTabFilterSelectors.NameInput]}
            className={cnRegexpInput}
            flex
            allowClear
            placeholder={props.inputPlaceholder}
            value={props.inputValue ?? ''}
            status={props.inputValid === false ? 'error' : ''}
            onValueChange={props.onInputChange}
            addonAfter={
                props.caseSensitive !== undefined && props.onCaseSensitiveToggle !== undefined ? (
                    <Switch
                        {...ETableTabFilterProps[ETableTabFilterSelectors.SwitchButton]}
                        size="small"
                        title="Case Sensitive"
                        checked={props.caseSensitive}
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        onChange={props.onCaseSensitiveToggle}
                    />
                ) : (
                    // Nested structure with addon and without differs, this forces rerenders and focus lost
                    <></>
                )
            }
        />
    );
}
