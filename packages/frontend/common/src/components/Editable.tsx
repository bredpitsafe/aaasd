import { EditOutlined } from '@ant-design/icons';
import cn from 'classnames';
import type { ReactComponentElement, ReactElement, ReactNode } from 'react';
import type React from 'react';
import { cloneElement, useMemo, useState } from 'react';
import { useHover } from 'react-use';

import type { TWithClassname, TWithStyle } from '../types/components';
import { useFunction } from '../utils/React/useFunction';
import { cnIcon, cnRoot, cnWithCursor } from './Editable.css';
import type { InputProps } from './Input';
import { Input } from './Input';
import type { InputNumberProps } from './InputNumber';
import { InputNumber } from './InputNumber';

const defaultIcon: ReactElement = <EditOutlined />;

export function Editable<T extends number | string>(
    props: {
        value: ReactNode;
        input: ReactComponentElement<typeof Input> | ReactComponentElement<typeof InputNumber>;
        icon?: ReactElement;
        title?: string;
        onChange: (value: T) => void;
        onCancel?: () => void;
    } & TWithStyle &
        TWithClassname,
): ReactElement {
    const [editable, startEdit] = useState(false);
    const [newValue, setNewValue] = useState<T | void>(undefined);
    const icon = useMemo(() => {
        const base = props.icon || defaultIcon;
        return cloneElement(props.icon || defaultIcon, {
            className: cn(base.props.className, cnIcon),
        });
    }, [props.icon]);
    const onKeyUp = useFunction((event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') {
            if (newValue !== undefined) {
                props.onChange(newValue as T);
            }
            startEdit(false);
            setNewValue(undefined);
        }
        if (event.key === 'Escape') {
            onBlur();
        }
    });
    const onBlur = useFunction((): void => {
        props.onCancel?.();
        startEdit(false);
        setNewValue(undefined);
    });
    const onStartEdit = useFunction(() => startEdit(true));

    const input = useMemo(() => {
        if (props.input.type === Input) {
            return cloneElement<InputProps>(props.input as ReactComponentElement<typeof Input>, {
                autoFocus: true,
                onChange: (event) => setNewValue(event.target.value as T),
                onKeyUp,
                onBlur,
            });
        }

        if (props.input.type === InputNumber) {
            return cloneElement<InputNumberProps>(
                props.input as ReactComponentElement<typeof InputNumber>,
                {
                    autoFocus: true,
                    onChange: (v) => setNewValue(v as T),
                    onKeyUp,
                    onBlur,
                },
            );
        }
    }, [props.input, onKeyUp, onBlur]);

    const [element] = useHover((hovered) => {
        const className = cn(props.className, cnRoot, {
            [cnWithCursor]: !editable,
        });
        return (
            <div className={className} style={props.style} onClick={onStartEdit}>
                {!editable && props.value}
                {!editable && hovered && icon}
                {editable && input}
            </div>
        );
    });

    return element;
}
