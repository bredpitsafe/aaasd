import type { Nil, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import type { TWithFormik } from '@frontend/common/src/components/Formik';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import type { TAsset } from '@frontend/common/src/types/domain/asset';
import type { TExchange } from '@frontend/common/src/types/domain/exchange';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument';
import type { TStrategyOption } from '@frontend/common/src/types/domain/ownTrades';
import type { TTradingStatsFilter } from '@frontend/common/src/types/domain/tradingStats';
import { useDebouncedFunction } from '@frontend/common/src/utils/React/useDebouncedFunction';
import dayjs from 'dayjs';
import { Formik } from 'formik';
import type { FormikHelpers } from 'formik/dist/types';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useEffect, useMemo } from 'react';
import shallowEqual from 'shallowequal';
import * as Yup from 'yup';

import { DailyStatsFilterView } from './dailyStatsFilterView';
import { MonthlyStatsFilterView } from './monthlyStatsFilterView';

type TTradingStatsFilterProps = {
    assets: TAsset[] | Nil;
    exchanges: TExchange[];
    instruments: TInstrument[] | Nil;

    filter: TTradingStatsFilter | undefined;
    strategies: TStrategyOption[] | undefined;
    isMonthlyStats: boolean;
    timeZone: TimeZone;

    onSubmit: (props: TTradingStatsFilter) => unknown | Promise<unknown>;
    onReset: VoidFunction;
};

const dailyStatsSchemaShape = {
    date: Yup.string()
        .nullable(true)
        .test('is-valid-date', `Provide date in ${EDateTimeFormats.Date} format`, (value) =>
            dayjs(value, EDateTimeFormats.Date).isValid(),
        ),
    backtestingId: Yup.number().optional(),
};

const dailyStatsValidationSchema = Yup.object().shape(dailyStatsSchemaShape);

const monthlyStatsValidationSchema = Yup.object().shape({
    ...dailyStatsSchemaShape,
    to: Yup.string()
        .test('is-valid-date', `Provide date in ${EDateTimeFormats.Date} format`, (value) =>
            dayjs(value, EDateTimeFormats.Date).isValid(),
        )
        .test(
            'is-valid-interval',
            `Date should not be less than 'from' value`,
            (value, context) => {
                const from = dayjs(context.parent.date, EDateTimeFormats.Date);
                const to = dayjs(value, EDateTimeFormats.Date);
                return to.diff(from) >= 0;
            },
        ),
});

export function TradingStatsFilter({
    assets,
    instruments,
    exchanges,
    strategies,
    isMonthlyStats,
    filter,
    timeZone,
    onSubmit,
    onReset,
}: TTradingStatsFilterProps): ReactElement {
    const handleSubmit = useDebouncedFunction(
        async (
            filter: TTradingStatsFilter,
            { setSubmitting }: FormikHelpers<TTradingStatsFilter>,
        ) => {
            await onSubmit(filter);
            setSubmitting(false);
        },
        500,
    );

    if (isNil(filter)) {
        return <LoadingOverlay text="Loading filters..." />;
    }

    return (
        <Formik<TTradingStatsFilter>
            initialValues={filter}
            enableReinitialize
            validationSchema={
                isMonthlyStats ? monthlyStatsValidationSchema : dailyStatsValidationSchema
            }
            onSubmit={handleSubmit}
        >
            {(formik) => (
                <TradingStatsFilterRenderer
                    formik={formik}
                    filterValues={filter}
                    exchanges={exchanges}
                    strategies={strategies}
                    assets={assets}
                    instruments={instruments}
                    isMonthlyStats={isMonthlyStats}
                    onReset={onReset}
                    timeZone={timeZone}
                />
            )}
        </Formik>
    );
}

type TTradingStatsFilterRendererProps = TWithFormik<TTradingStatsFilter> & {
    timeZone: TimeZone;
    isMonthlyStats: boolean;
    strategies: TStrategyOption[] | undefined;
    assets: TAsset[] | Nil;
    exchanges: TExchange[];
    instruments: TInstrument[] | Nil;
    filterValues: TTradingStatsFilter;
    onReset: VoidFunction;
};

function TradingStatsFilterRenderer(props: TTradingStatsFilterRendererProps): ReactElement | null {
    const {
        formik,
        filterValues,
        assets,
        instruments,
        exchanges,
        strategies,
        isMonthlyStats,
        onReset,
        timeZone,
    } = props;
    /* Update form with values from URL when URL changes */
    useEffect(() => {
        formik.setValues(filterValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterValues]);

    const dirty = useMemo(
        () => !shallowEqual(formik.values, filterValues),
        [formik.values, filterValues],
    );

    return isMonthlyStats ? (
        <MonthlyStatsFilterView
            {...formik}
            assets={assets ?? []}
            instruments={instruments ?? []}
            exchanges={exchanges}
            strategies={strategies}
            dirty={dirty}
            resetForm={onReset}
            timeZone={timeZone}
        />
    ) : (
        <DailyStatsFilterView
            {...formik}
            assets={assets ?? []}
            instruments={instruments ?? []}
            exchanges={exchanges}
            strategies={strategies}
            dirty={dirty}
            resetForm={onReset}
            timeZone={timeZone}
        />
    );
}
