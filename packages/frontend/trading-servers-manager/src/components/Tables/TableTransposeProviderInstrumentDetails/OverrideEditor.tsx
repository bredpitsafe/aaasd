import type { ISO, Nil, TimeZone } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import { assertNever } from '@common/utils/src/assert.ts';
import type { ICellEditorParams } from '@frontend/ag-grid/src/ag-grid-community.ts';
import { cnInput } from '@frontend/common/src/components/AgTable/editors/style.css.ts';
import { DatePicker } from '@frontend/common/src/components/DatePicker';
import type { InputProps } from '@frontend/common/src/components/Input';
import { Input } from '@frontend/common/src/components/Input';
import type { InputNumberProps } from '@frontend/common/src/components/InputNumber';
import { DEFAULT_NUMBER_FORMATTER, InputNumber } from '@frontend/common/src/components/InputNumber';
import type { SelectProps } from '@frontend/common/src/components/Select';
import { Select } from '@frontend/common/src/components/Select';
import { useDeepEqualProp } from '@frontend/common/src/hooks/useDeepEqualProp.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState.ts';
import type { Dayjs } from 'dayjs';
import { isEmpty, isEqual, isNil } from 'lodash-es';
import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import type {
    TEditablePropertyCell,
    TProviderPropertyRow,
    TSelectCellEditorParams,
} from '../defs.ts';
import { EDataKind } from '../defs.ts';

export const OverrideEditor = memo(
    forwardRef(
        (
            props: ICellEditorParams<
                TProviderPropertyRow,
                Exclude<TEditablePropertyCell, { editable: false }>
            > & { timeZone: TimeZone },
            ref,
        ) => {
            const { stopEditing } = props;
            const [value, setValue] = useSyncState(props.value?.data, [props.value?.data]);
            const [stopEditingFlag, setStopEditingFlag] = useState<boolean>(false);
            useEffect(() => {
                if (stopEditingFlag) {
                    stopEditing();
                }
            }, [stopEditingFlag, stopEditing]);

            const setValueAndComplete = useFunction((value) => {
                setValue(value);
                setStopEditingFlag(true);
            });

            useImperativeHandle(ref, () => {
                return {
                    getValue() {
                        if (
                            isNil(props.value) ||
                            !('kind' in props.value) ||
                            !props.value.editable
                        ) {
                            return props.value;
                        }

                        const { kind } = props.value;

                        switch (kind) {
                            case EDataKind.String:
                                const newValue = (value as string | undefined)?.trim() ?? '';
                                const oldValue = props.value?.data ?? '';

                                if (newValue === oldValue) {
                                    return props.value;
                                }

                                return {
                                    ...props.value,
                                    data: isEmpty(newValue) ? undefined : newValue,
                                };
                            case EDataKind.Select:
                            case EDataKind.Number:
                            case EDataKind.DateTime:
                                if (isEqual(value, props.value?.data)) {
                                    return props.value;
                                }

                                return { ...props.value, data: value ?? undefined };
                            default:
                                assertNever(kind);
                        }
                    },
                };
            });

            if (isNil(props.value) || !('kind' in props.value)) {
                return null;
            }

            const { kind } = props.value;

            switch (kind) {
                case EDataKind.String:
                    return (
                        <StringInputEditor
                            onChange={setValue as (value: string | Nil) => void}
                            onComplete={setValueAndComplete}
                            className={cnInput}
                            value={value}
                            bordered={false}
                        />
                    );
                case EDataKind.Number:
                    return (
                        <NumberInputEditor
                            onChange={setValue as (value: number | Nil) => void}
                            onComplete={setValueAndComplete}
                            className={cnInput}
                            value={value as number | null}
                            formatter={DEFAULT_NUMBER_FORMATTER}
                            bordered={false}
                            controls={false}
                        />
                    );
                case EDataKind.Select:
                    return (
                        <SelectEditor
                            onChange={setValueAndComplete}
                            className={cnInput}
                            value={value as string | number | Nil}
                            params={props.value.params}
                            bordered={false}
                        />
                    );
                case EDataKind.DateTime:
                    return (
                        <DateEditor
                            value={value as ISO | Nil}
                            onChange={setValueAndComplete}
                            timeZone={props.timeZone}
                        />
                    );
                default:
                    assertNever(kind);
            }
        },
    ),
);

const StringInputEditor = memo(
    ({
        onChange,
        onComplete,
        ...props
    }: Omit<InputProps, 'onChange'> & {
        onChange: (value: string) => void;
        onComplete: (value: string) => void;
    }) => {
        const cbChange = useFunction((e) => onChange(e.target.value ?? ''));
        const cbComplete = useFunction(() => onComplete((props.value as string | undefined) ?? ''));

        return <Input autoFocus {...props} onChange={cbChange} onBlur={cbComplete} />;
    },
);

const NumberInputEditor = memo(
    ({
        onChange,
        onComplete,
        ...props
    }: Omit<InputNumberProps<number>, 'onChange' | 'value'> & {
        onChange: (value: number | Nil) => void;
        value: number | Nil;
        onComplete: (value: number | Nil) => void;
    }) => {
        const cbChange = useFunction((value: number | Nil) => onChange(value));
        const cbComplete = useFunction(() => onComplete(props.value as number | undefined));

        return <InputNumber<number> autoFocus {...props} onChange={cbChange} onBlur={cbComplete} />;
    },
);

const SelectEditor = memo(
    (
        props: Omit<
            SelectProps<string | number>,
            'onChange' | 'value' | 'options' | 'allowClear' | 'onSelect'
        > & {
            onChange: (value: string | number | Nil) => void;
            value: string | number | Nil;
            params: TSelectCellEditorParams;
        },
    ) => {
        const onChange = useFunction((value: string | number | null) => props.onChange(value));

        const values = useDeepEqualProp(
            useMemo(
                () =>
                    isNil(props.value) || props.params.values.includes(props.value)
                        ? props.params.values
                        : [props.value, ...props.params.values],
                [props.params.values, props.value],
            ),
        );
        const { valueFormatter } = props.params;

        const options = useMemo(
            () =>
                values.map((value) => ({
                    value,
                    label: isNil(valueFormatter) ? value : valueFormatter(value),
                })),
            [values, valueFormatter],
        );

        return (
            <Select
                autoFocus
                {...props}
                onSelect={onChange}
                allowClear={!props.params.suppressEmpty}
                options={options}
                dropdownMatchSelectWidth={false}
                showAction={['focus']}
            />
        );
    },
);

const DateEditor = memo(
    ({
        value,
        onChange,
        timeZone,
    }: {
        onChange: (value: ISO | Nil) => void;
        value: ISO | Nil;
        timeZone: TimeZone;
    }) => {
        const cbChange = useFunction((value: Dayjs | Nil) =>
            onChange(value?.toISOString() as ISO | Nil),
        );

        const date = useMemo(
            () => (isNil(value) ? undefined : toDayjsWithTimezone(value, timeZone)),
            [value, timeZone],
        );

        return (
            <DatePicker
                autoFocus
                size="small"
                showTime
                timeZone={timeZone}
                value={date}
                onChange={cbChange}
            />
        );
    },
);
