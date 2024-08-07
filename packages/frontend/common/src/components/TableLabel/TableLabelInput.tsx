import cn from 'classnames';
import type { ChangeEvent, ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { createTestProps } from '../../../e2e';
import { ETableTabFilterSelectors } from '../../../e2e/selectors/table-tab.filter.selectors';
import type { TWithClassname } from '../../types/components';
import { useFunction } from '../../utils/React/useFunction';
import { useKeypressCallback } from '../../utils/React/useKeypressCallback';
import type { InputProps } from '../Input';
import { Input } from '../Input';
import { TableLabel } from './TableLabel';
import { cnFlexGrow, cnInput, cnLabel } from './TableLabelInput.css';

export type TTableLabelInputProps = InputProps &
    TWithClassname & {
        flex?: boolean;
        value: string;
        onValueChange: (value: string) => void;
    };

export function TableLabelInput(props: TTableLabelInputProps): ReactElement {
    const { flex, value: externalValue, onValueChange, ...restProps } = props;
    const [value, setValue] = useState(externalValue);

    useEffect(() => setValue(externalValue), [externalValue]);

    const cbChange = useFunction((event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);

        if (event.type === 'click' && event.target.value === '') {
            onValueChange('');
        }
    });

    const cbKeyPressEnter = useKeypressCallback(['Escape', 'Enter'], () => onValueChange(value), [
        onValueChange,
        value,
    ]);

    return (
        <TableLabel className={cn(cnLabel, { [cnFlexGrow]: flex })}>
            <Input
                {...createTestProps(ETableTabFilterSelectors.NameInput)}
                value={value}
                className={cnInput}
                size="small"
                onChange={cbChange}
                onKeyUpCapture={cbKeyPressEnter}
                {...restProps}
            >
                {props.children}
            </Input>
        </TableLabel>
    );
}
