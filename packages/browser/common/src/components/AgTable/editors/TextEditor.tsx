import { WarningOutlined } from '@ant-design/icons';
import type { ICellEditorParams } from 'ag-grid-enterprise';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import {
    ChangeEvent,
    ComponentProps,
    forwardRef,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react';

import { useFunction } from '../../../utils/React/useFunction';
import { Input } from '../../Input';
import { cnErrorColorIcon, cnInput, cnWarnColorIcon } from './style.css';

export type TTextEditorStatus = ComponentProps<typeof Input>['status'];

export const TextEditor = forwardRef(
    (
        {
            value: originalValue,
            validate,
        }: ICellEditorParams<never, string> & {
            validate?: (
                value: undefined | string,
            ) => undefined | { status: TTextEditorStatus; message?: string };
        },
        ref,
    ) => {
        const [value, setValue] = useState(originalValue);

        const handleValueSet = useFunction(({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
            setValue(value),
        );

        const validationResult = useMemo(
            () => (!isNil(value) ? validate?.(value) : undefined),
            [validate, value],
        );

        useImperativeHandle(ref, () => ({
            getValue: () =>
                !isNil(validationResult) && validationResult.status === 'error'
                    ? originalValue
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
                onChange={handleValueSet}
                className={cnInput}
                value={value ?? undefined}
                bordered={false}
                autoFocus
                suffix={suffix}
            />
        );
    },
);
