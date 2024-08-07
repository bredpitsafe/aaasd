import { WarningOutlined } from '@ant-design/icons';
import type { Nil } from '@common/types';
import { assert } from '@common/utils';
import type { ICellEditorParams } from 'ag-grid-enterprise';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ChangeEvent, ComponentProps, Ref } from 'react';
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';

import { useFunction } from '../../../utils/React/useFunction';
import { Input } from '../../Input';
import { cnErrorColorIcon, cnInput, cnWarnColorIcon } from './style.css';
export type TTextEditorStatus = ComponentProps<typeof Input>['status'];

export const TextEditor = forwardRef(
    <T,>(
        {
            value: originalValue,
            validate,
            valueGetter,
        }: ICellEditorParams<never, T> & {
            validate?: (
                value: undefined | string,
            ) => undefined | { status: TTextEditorStatus; message?: string };
            valueGetter?: (value: T | Nil) => undefined | string;
        },
        ref: Ref<unknown> | undefined,
    ) => {
        const originalValueString = useMemo(() => {
            const possiblyString = isNil(valueGetter)
                ? originalValue
                : valueGetter?.(originalValue);

            assert(
                typeof possiblyString === 'string',
                `value provided to TextEditor component must be a string, instead got ${typeof possiblyString}`,
            );

            return possiblyString;
        }, [originalValue, valueGetter]);

        const [value, setValue] = useState<string | undefined>(originalValueString);
        const handleChange = useFunction(({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
            setValue(value),
        );

        const validationResult = useMemo(
            () => (!isNil(value) ? validate?.(value) : undefined),
            [validate, value],
        );

        useImperativeHandle(ref, () => ({
            getValue: () =>
                !isNil(validationResult) && validationResult.status === 'error'
                    ? originalValueString
                    : value,
        }));

        const suffix = useMemo(
            () =>
                isNil(validationResult) ? undefined : (
                    <WarningOutlined
                        className={cn({
                            [cnErrorColorIcon]: validationResult.status === 'error',
                            [cnWarnColorIcon]: validationResult.status === 'warning',
                        })}
                        title={validationResult.message}
                    />
                ),
            [validationResult],
        );

        return (
            <Input
                onChange={handleChange}
                className={cnInput}
                value={value ?? undefined}
                bordered={false}
                autoFocus
                suffix={suffix}
            />
        );
    },
);
