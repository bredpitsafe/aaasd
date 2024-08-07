import type { TimeZone } from '@common/types';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import type { TWithClassname } from '../../types/components';
import type { TInstrument } from '../../types/domain/instrument';
import { useFunction } from '../../utils/React/useFunction';
import { Button } from '../Button';
import { Error } from '../Error/view';
import { LoadingOverlay } from '../overlays/LoadingOverlay';
import { DiffDateTime } from './components/DiffDateTime';
import { OrderBookForm } from './components/OrderBookForm';
import {
    styleColumn1,
    styleColumn2,
    styleNavigationButton,
    styleNavigationControls,
    styleNavigationLabel,
    styleNavigationLabelValue,
    styleOrderBookContainer,
    styleOrderBookPageView,
    styleSpan2,
} from './components/style.css';
import type { TOrderBookData, TOrderBookFormFilter } from './defs';
import { useNormalizeOrderBookData } from './hooks/useNormalizeOrderBookData';
import { OrderBook } from './OrderBook';
import { isError } from './utils';

type TOrderBookViewProps = TWithClassname & {
    instruments?: TInstrument[];
    data?: Error | TOrderBookData;
    filter?: TOrderBookFormFilter;
    timeZone: TimeZone;
    currentStep: number;
    onApplyFilter(filters: TOrderBookFormFilter): void;
    onChangeStep(currentStep: number): void;
    onError(error: string): void;
};

export const OrderBookView = memo(
    ({
        className,
        instruments,
        data,
        filter,
        currentStep,
        timeZone,
        onApplyFilter,
        onChangeStep,
        onError,
    }: TOrderBookViewProps) => {
        const normalizedData = useNormalizeOrderBookData(data);

        const decrementStep = useFunction(() => onChangeStep(currentStep - 1));
        const incrementStep = useFunction(() => onChangeStep(currentStep + 1));

        const notRequested = isNil(filter);
        const loading = isNil(normalizedData);
        const hasError = isError(normalizedData);
        const hasData = !loading && !hasError;

        return (
            <div className={cn(className, styleOrderBookPageView)}>
                <div className={styleOrderBookContainer}>
                    {notRequested ? (
                        <Error status="info" title="No rows to display" />
                    ) : (
                        <>
                            {loading && <LoadingOverlay text="Loading OrderBook data..." />}
                            {hasError && (
                                <Error status="error" title="Failed to load OrderBook data" />
                            )}
                            {hasData && (
                                <OrderBook
                                    current={normalizedData.snapshot}
                                    update={normalizedData.update}
                                />
                            )}
                        </>
                    )}
                </div>

                <div className={styleNavigationControls}>
                    <OrderBookForm
                        className={styleSpan2}
                        instruments={instruments}
                        filter={filter}
                        timeZone={timeZone}
                        onApplyFilter={onApplyFilter}
                        onError={onError}
                    />

                    {hasData && (
                        <>
                            <Button
                                className={cn(styleColumn1, styleNavigationButton)}
                                disabled={normalizedData.stepRange.min >= currentStep}
                                onClick={decrementStep}
                            >
                                Previous
                            </Button>
                            <Button
                                className={cn(styleColumn2, styleNavigationButton)}
                                disabled={normalizedData.stepRange.max <= currentStep}
                                onClick={incrementStep}
                                loading={normalizedData.loading}
                            >
                                Next
                            </Button>

                            <span className={styleNavigationLabel}>Platform Time</span>
                            <DiffDateTime
                                leftTime={normalizedData.snapshot.platformTime}
                                rightTime={normalizedData.update.platformTime}
                                timeZone={timeZone}
                            />

                            <span className={styleNavigationLabel}>Exchange Time</span>
                            <DiffDateTime
                                leftTime={normalizedData.snapshot.exchangeTime}
                                rightTime={normalizedData.update.exchangeTime}
                                timeZone={timeZone}
                            />

                            <span className={styleNavigationLabel}>Sequence No</span>
                            <span className={styleNavigationLabelValue}>
                                {normalizedData.snapshot.sequenceNo || '—'}
                            </span>
                            <span className={styleNavigationLabelValue}>
                                {normalizedData.update.sequenceNo || '—'}
                            </span>
                        </>
                    )}
                </div>
            </div>
        );
    },
);
