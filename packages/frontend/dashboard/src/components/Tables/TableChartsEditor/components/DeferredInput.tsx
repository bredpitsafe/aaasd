import { WarningOutlined } from '@ant-design/icons';
import { Input, InputProps } from '@frontend/common/src/components/Input';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import { ChangeEvent, memo, useMemo, useState } from 'react';
import { useUnmount } from 'react-use';

export const DeferredInput = memo(
    (
        props: Omit<InputProps, 'value' | 'onChange'> & {
            value?: string;
            onChange?: (value: string) => void;
            onValidate?: (value: string) => string | undefined;
        },
    ) => {
        const { onChange, onValidate } = props;

        const [value, setValue] = useState(props.value ?? '');

        const errorText = useMemo(() => onValidate?.(value), [onValidate, value]);

        const changeHandler = useFunction(() => {
            if (props.value !== value && isNil(errorText)) {
                onChange?.(value);
            }
        });

        const updateInternal = useFunction((e: ChangeEvent<HTMLInputElement>) =>
            setValue(e.target.value ?? ''),
        );

        useUnmount(() => changeHandler());

        return (
            <Input
                {...props}
                value={value}
                onChange={updateInternal}
                onBlur={changeHandler}
                onPressEnter={changeHandler}
                status={isNil(errorText) ? undefined : 'error'}
                suffix={
                    isNil(errorText) ? (
                        // Rerender without suffix triggers focus loose bug
                        <></>
                    ) : (
                        <WarningOutlined title={errorText} />
                    )
                }
            />
        );
    },
);
