import cn from 'classnames';
import { ChangeEvent, ReactElement, useEffect, useState } from 'react';

import { TWithClassname } from '../../types/components';
import { useFunction } from '../../utils/React/useFunction';
import { useKeypressCallback } from '../../utils/React/useKeypressCallback';
import { Input, InputProps } from '../Input';
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
