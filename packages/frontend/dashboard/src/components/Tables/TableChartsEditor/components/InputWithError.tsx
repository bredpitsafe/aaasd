import { WarningOutlined } from '@ant-design/icons';
import type { InputProps } from '@frontend/common/src/components/Input';
import { Input } from '@frontend/common/src/components/Input';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState';
import { isNil } from 'lodash-es';
import type { ChangeEvent } from 'react';
import { memo, useMemo, useRef } from 'react';

const DEFAULT_DEBOUNCE_TIME = 1500;

export const InputWithError = memo(
    (
        props: Omit<InputProps, 'value' | 'onChange' | 'defaultValue'> & {
            value?: string;
            onChange?: (value: string) => void;
            onValidate?: (value: string) => string | undefined;
            defaultValue?: string | undefined;
            debounceTime?: number;
        },
    ) => {
        const { onChange, onValidate, defaultValue, debounceTime = DEFAULT_DEBOUNCE_TIME } = props;

        const [inputValue, setInputValue] = useSyncState(defaultValue ?? '', [defaultValue]);
        // use it to make the "Accept" button active even without onBlur
        const timeoutRef = useRef<NodeJS.Timeout | null>(null);

        const errorText = useMemo(() => onValidate?.(inputValue ?? ''), [onValidate, inputValue]);

        const updateInternal = useFunction((e: ChangeEvent<HTMLInputElement>) => {
            if (timeoutRef.current && onChange) {
                clearTimeout(timeoutRef.current);
            }
            onValidate?.(e.target.value ?? '');
            setInputValue(e.target.value ?? '');

            if (onChange) {
                timeoutRef.current = setTimeout(() => {
                    onChange?.(e.target.value ?? '');
                }, debounceTime);
            }
        });

        const handleUpdateFormValue = useFunction(() => {
            if (inputValue !== defaultValue) {
                // use it to clear timeout to prevent input from save twice
                if (timeoutRef.current && onChange) {
                    clearTimeout(timeoutRef.current);
                }
                onChange?.(inputValue);
            }
        });

        return (
            <Input
                {...props}
                value={inputValue}
                onChange={updateInternal}
                onBlur={handleUpdateFormValue}
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
