import { SnippetsOutlined } from '@ant-design/icons';
import type { FieldProps, FormikProps } from 'formik';
import { Field } from 'formik-antd';
import { defer, isEmpty, isNil } from 'lodash-es';
import { memo, useMemo, useState } from 'react';
import * as Yup from 'yup';

import {
    OrderBookTabProps,
    OrderBookTabSelectors,
} from '../../../../e2e/selectors/trading-servers-manager/components/order-book-tab/order-book.tab.selectors';
import type { TInstrument, TInstrumentId } from '../../../types/domain/instrument';
import { clipboardRead } from '../../../utils/clipboard';
import { EMPTY_ARRAY } from '../../../utils/const';
import { useFunction } from '../../../utils/React/useFunction';
import { Button } from '../../Button';
import { FormikForm } from '../../Formik';
import { FormikSelect } from '../../Formik/components/FormikSelect';
import { styleInstrumentSelector, styleInstrumentSelectorInput } from './style.css';

const FIELD_NAME = 'instrumentId';
export const INSTRUMENT_SCHEMA = { [FIELD_NAME]: Yup.number().required() };

export type TInstrumentsProps = {
    [FIELD_NAME]?: TInstrumentId;
};

type TInstrumentSelectProps = {
    instruments?: TInstrument[];
    onError(error: string): void;
};

export const InstrumentSelector = memo(({ instruments, onError }: TInstrumentSelectProps) => {
    const [instrumentId, setInstrumentId] = useState<TInstrumentId | undefined>();

    const loading = useMemo(() => isEmpty(instruments), [instruments]);

    const options =
        useMemo(
            () =>
                instruments?.map(({ id, name, exchange }) => ({
                    label: `${name}|${exchange}`,
                    value: id,
                })),
            [instruments],
        ) ?? EMPTY_ARRAY;

    const updateInstrument = useFunction(
        async ({
            setFieldValue,
            setFieldTouched,
            validateForm,
        }: FormikProps<TInstrumentsProps>) => {
            const clipboardData = (await clipboardRead()).trim();

            const instrumentId = findInstrumentId(clipboardData, options);

            if (isNil(instrumentId)) {
                if (isEmpty(clipboardData)) {
                    onError(`Clipboard doesn't contain data`);
                } else {
                    onError('Instrument is not found');
                }

                return;
            }

            setFieldTouched(FIELD_NAME);
            setFieldValue(FIELD_NAME, instrumentId, true);
            // Unknown bug - setFieldValue is probably async operation and the value is not set immediatelly
            defer(async () => await validateForm());
        },
    );

    const clipboardButton = useMemo(
        () => (
            // @ts-ignore
            <Field name={FIELD_NAME}>
                {({ form }: FieldProps) => (
                    <Button
                        {...OrderBookTabProps[OrderBookTabSelectors.InstrumentButton]}
                        type="text"
                        icon={<SnippetsOutlined />}
                        title="Select Instrument"
                        onClick={() => updateInstrument(form)}
                    />
                )}
            </Field>
        ),
        [updateInstrument],
    );

    return (
        <FormikForm.Item
            className={styleInstrumentSelector}
            name={FIELD_NAME}
            label={
                loading ? (
                    'Instrument'
                ) : (
                    <>
                        <span>Instrument</span>
                        {clipboardButton}
                    </>
                )
            }
        >
            <FormikSelect
                {...OrderBookTabProps[OrderBookTabSelectors.SelectInstrumentSelector]}
                name={FIELD_NAME}
                className={styleInstrumentSelectorInput}
                value={instrumentId}
                onChange={setInstrumentId}
                options={options}
                showSearch
                loading={loading}
                optionFilterProp="label"
                placeholder={loading ? 'Loading instruments...' : 'Select instrument'}
            />
        </FormikForm.Item>
    );
});

function findInstrumentId(
    value: string,
    options: { label: string; value: TInstrumentId }[],
): undefined | TInstrumentId {
    if (isEmpty(value)) {
        return;
    }

    if (/^\d+$/.test(value)) {
        const instrumentId = parseInt(value, 10) as TInstrumentId;
        return options.some(({ value }) => value === instrumentId) ? instrumentId : undefined;
    } else {
        return options.find(({ label }) => label === value)?.value;
    }
}
