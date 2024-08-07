import { type InputRef, Input as BaseInput } from 'antd';
import type { InputProps } from 'antd/lib/input';
import cn from 'classnames';
import type { ForwardedRef, ReactElement } from 'react';
import { forwardRef, useLayoutEffect, useRef } from 'react';
import mergeRefs from 'react-merge-refs';

import type { TWithClassname, TWithStyle } from '../types/components';
import { useFunction } from '../utils/React/useFunction';
import { cnContent, cnRoot } from './Input.css';

// Fix cursor position on change
const Input = forwardRef((props: InputProps, ref: ForwardedRef<InputRef>): ReactElement => {
    const inputRef = useRef<InputRef>(null);
    const selectionRef = useRef<{
        start: null | number;
        end: null | number;
    }>({
        start: null,
        end: null,
    });
    const handleChange = useFunction((e) => {
        selectionRef.current.start = inputRef.current?.input?.selectionStart ?? null;
        selectionRef.current.end = inputRef.current?.input?.selectionEnd ?? null;
        props.onChange?.(e);
    });

    useLayoutEffect(() => {
        const input = inputRef.current?.input;

        if (input) {
            selectionRef.current.start !== null &&
                (input.selectionStart = selectionRef.current.start);
            selectionRef.current.end !== null && (input.selectionEnd = selectionRef.current.end);
        }
    }, [props.value]);

    return <BaseInput {...props} ref={mergeRefs([inputRef, ref])} onChange={handleChange} />;
});

function FakeInput(props: { value?: string | number } & TWithClassname & TWithStyle): ReactElement {
    return (
        <div
            className={cn('ant-input-number', cnRoot, props.className)}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'auto',
                ...props.style,
            }}
        >
            <div className={cnContent}>{props.value}</div>
        </div>
    );
}

const InputGroup = BaseInput.Group;

export { Input, InputProps, FakeInput, InputGroup, InputRef };
