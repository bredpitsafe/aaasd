import type { Milliseconds, Nanoseconds, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import {
    formatNanoDate,
    iso2milliseconds,
    iso2NanoDate,
    milliseconds2seconds,
    NanoDate,
} from '@common/utils';
import { extractValidNumber } from '@common/utils/src/extract.ts';
import { Button } from 'antd';
import cn from 'classnames';
import { Formik } from 'formik';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';
import * as Yup from 'yup';

import {
    OrderBookTabProps,
    OrderBookTabSelectors,
} from '../../../../e2e/selectors/trading-servers-manager/components/order-book-tab/order-book.tab.selectors';
import type { TWithClassname } from '../../../types/components';
import type { TInstrument } from '../../../types/domain/instrument';
import { useFunction } from '../../../utils/React/useFunction';
import { FormikForm } from '../../Formik';
import type { TOrderBookFormFilter } from '../defs';
import type { TDepth } from './DepthSelector';
import { DEPTH_SCHEMA, DepthSelector } from './DepthSelector';
import type { TInstrumentsProps } from './InstrumentSelector';
import { INSTRUMENT_SCHEMA, InstrumentSelector } from './InstrumentSelector';
import type { TPlatformTime } from './PlatformTimeSelector';
import { PLATFORM_TIME_SCHEMA, PlatformTimeSelector } from './PlatformTimeSelector';
import { styleApplyButton, styleOrderBookForm } from './style.css';

type TOrderBookViewProps = TWithClassname & {
    instruments?: TInstrument[];
    filter?: TOrderBookFormFilter;
    timeZone: TimeZone;
    onApplyFilter(filters: TOrderBookFormFilter): void;
    onError(error: string): void;
};

type TRawFilter = TInstrumentsProps & TPlatformTime & TDepth;

const SCHEMA = Yup.object().shape({
    ...INSTRUMENT_SCHEMA,
    ...PLATFORM_TIME_SCHEMA,
    ...DEPTH_SCHEMA,
});

export const OrderBookForm = memo(
    ({ className, instruments, filter, timeZone, onApplyFilter, onError }: TOrderBookViewProps) => {
        const submit = useFunction((values: TRawFilter) => {
            const date = NanoDate.from({
                unixSeconds: milliseconds2seconds(values.platformTimeMs as Milliseconds),
                nanoseconds: (!isNil(values.platformTimeNsPart) && values.platformTimeNsPart > 0
                    ? parseInt(values.platformTimeNsPart.toFixed(0).substring(0, 9))
                    : 0) as Nanoseconds,
            });

            onApplyFilter({
                platformTime: date.toISOStringNanoseconds(),
                instrumentId: values.instrumentId!,
                depth: values.depth!,
            });
        });

        const formikInitialValue = useMemo(() => {
            if (isNil(filter)) {
                return { depth: 10 };
            }

            return {
                instrumentId: filter.instrumentId,
                platformTimeMs: isNil(filter.platformTime)
                    ? undefined
                    : iso2milliseconds(filter.platformTime),
                platformTimeNsPart: isNil(filter.platformTime)
                    ? undefined
                    : (extractValidNumber(
                          formatNanoDate(
                              iso2NanoDate(filter.platformTime),
                              EDateTimeFormats.SubSecondPart,
                              timeZone,
                          ),
                      ) as Nanoseconds) || undefined,
                depth: filter.depth,
            };
        }, [filter, timeZone]);

        return (
            <Formik<TRawFilter>
                initialValues={formikInitialValue}
                validationSchema={SCHEMA}
                onSubmit={submit}
            >
                {(formik) => (
                    <FormikForm
                        className={cn(className, styleOrderBookForm)}
                        layout="vertical"
                        size="small"
                    >
                        <InstrumentSelector instruments={instruments} onError={onError} />
                        <PlatformTimeSelector timeZone={timeZone} onError={onError} />
                        <DepthSelector />

                        <Button
                            {...OrderBookTabProps[OrderBookTabSelectors.ApplyButton]}
                            className={styleApplyButton}
                            type="primary"
                            size="middle"
                            disabled={!formik.isValid}
                            onClick={formik.submitForm}
                        >
                            Apply
                        </Button>
                    </FormikForm>
                )}
            </Formik>
        );
    },
);
