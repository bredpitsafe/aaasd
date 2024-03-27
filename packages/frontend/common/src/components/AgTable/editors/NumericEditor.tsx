import type { ICellEditorParams } from 'ag-grid-enterprise';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { DEFAULT_NUMBER_FORMATTER, InputNumber } from '../../InputNumber';
import { cnInput } from './style.css';

export const NumberEditor = forwardRef((props: ICellEditorParams, ref) => {
    const [value, setValue] = useState(props.value);
    const refInput = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        refInput.current?.focus();
    }, []);

    useImperativeHandle(ref, () => {
        return {
            getValue() {
                return parseFloat(value);
            },
        };
    });

    return (
        <InputNumber
            ref={refInput}
            onChange={setValue}
            className={cnInput}
            value={value}
            formatter={DEFAULT_NUMBER_FORMATTER}
            bordered={false}
            controls={false}
        />
    );
});
