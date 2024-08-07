import { InputNumber } from 'antd';
import type { FieldProps } from 'formik';
import { Field } from 'formik';
import type { InputNumber as FormikInputNumber } from 'formik-antd';
import { isEmpty, isNil } from 'lodash-es';
import type { ComponentProps } from 'react';
import { useRef } from 'react';

import { useFunction } from '../../../utils/React/useFunction';

const RE_ONLY_ZEROES = /^0+$/;

export const FormikInputNumberWithDecimalsZeroes = ({
    name,
    validate,
    onChange,
    onBlur,
    ...restProps
}: ComponentProps<typeof FormikInputNumber>) => {
    const inputValueRef = useRef('');

    const removeAllDotsExceptFirstOne = useFunction((str: string) => {
        return str.replace(/\.|/g, (_, offset) => {
            if (str.indexOf('.') === offset) {
                return '.';
            }
            return '';
        });
    });

    const replaceValue = useFunction((value: string) => {
        if (isEmpty(value)) {
            return '';
        }

        const keepOnlyNumbersString = value.replace(/[^0-9.-]/g, '');

        return removeAllDotsExceptFirstOne(keepOnlyNumbersString);
    });

    const removeZeroes = useFunction((value) => {
        if (RE_ONLY_ZEROES.test(value)) {
            return '0';
        }
        return value;
    });

    const handleInputChange = useFunction((name, inputValue, callback) => {
        const newInputValue = replaceValue(inputValue);
        const value = isNaN(parseFloat(removeZeroes(newInputValue)))
            ? ''
            : parseFloat(removeZeroes(newInputValue));
        inputValueRef.current = newInputValue;

        if (newInputValue === String(value)) {
            callback(name, value);
        }
    });

    const handleBlur = useFunction((name, callback) => {
        const newValue = removeZeroes(replaceValue(inputValueRef.current)).replace(
            /^0+(?!\.)/,
            '0',
        );
        const numberFromValue = parseFloat(newValue);

        if (!isNil(inputValueRef.current) && !isNaN(numberFromValue)) {
            inputValueRef.current = '';
            return callback(name, numberFromValue, true);
        }
    });

    const handleOnChange = useFunction((value) => {
        onChange && onChange(value);
    });

    return (
        <Field name={name} validate={validate}>
            {({ field: { value, onBlur: onBlurFormik }, form: { setFieldValue } }: FieldProps) => {
                return (
                    <InputNumber
                        name={name}
                        id={name}
                        value={value}
                        onChange={handleOnChange}
                        onInput={(value) => {
                            handleInputChange(name, value, setFieldValue);
                        }}
                        onBlur={async (event) => {
                            await handleBlur(name, setFieldValue);
                            onBlurFormik(event);
                            onBlur && onBlur(event);
                        }}
                        onStep={(value) => {
                            inputValueRef.current = String(value);
                            setFieldValue(name, value);
                        }}
                        stringMode
                        {...restProps}
                    />
                );
            }}
        </Field>
    );
};
