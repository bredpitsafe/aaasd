import { InputNumber, InputNumberProps } from '@frontend/common/src/components/InputNumber';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { memo, useState } from 'react';
import { useUnmount } from 'react-use';

export const DeferredNumberInput = memo(
    (
        props: Omit<InputNumberProps<number>, 'value' | 'onChange'> & {
            value?: number;
            onChange?: (value?: number) => void;
        },
    ) => {
        const [value, setValue] = useState(props.value);

        const changeHandler = useFunction(() => {
            if (props.value !== value) {
                props.onChange?.(value);
            }
        });

        const updateInternal = useFunction((value: number | null) => setValue(value ?? undefined));

        useUnmount(() => changeHandler());

        return (
            <InputNumber<number>
                {...props}
                value={value ?? null}
                onChange={updateInternal}
                onBlur={changeHandler}
                onPressEnter={changeHandler}
            />
        );
    },
);
