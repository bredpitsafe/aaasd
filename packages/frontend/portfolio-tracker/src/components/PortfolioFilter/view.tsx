import { Select } from '@frontend/common/src/components/Select';
import {
    TPortfolio,
    TPortfolioBook,
    TPortfolioBookId,
    TPortfolioId,
} from '@frontend/common/src/types/domain/portfolioTraсker';
import { TimeZone } from '@frontend/common/src/types/time';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useMemo } from 'react';

import { cnSelect } from './view.css';

type TPortfolioFilterProps = {
    timeZone: TimeZone;

    books: TPortfolioBook[];
    portfolios: TPortfolio[];

    currentBookIds: undefined | TPortfolioBookId[];
    // currentBoundTime: undefined | ISO;

    onChangeBookIds: (bookIds: undefined | TPortfolioBookId[]) => void | Promise<void>;
    // onChangeBoundTime: (boundTime: undefined | ISO) => void;
};

export function PortfolioFilter(props: TPortfolioFilterProps) {
    const portfolioBookOptions = useMemo(() => {
        return [
            {
                label: `Portfolios`,
                options: props.portfolios.map((book) => ({
                    label: book.name,
                    value: book.portfolioId,
                })),
            },
            {
                label: `Books`,
                options: props.books.map((book) => ({
                    label: book.name,
                    value: book.bookId,
                })),
            },
        ];
    }, [props.books, props.portfolios]);
    const handleBookIdChange = useFunction((value: Array<TPortfolioId | TPortfolioBookId>) => {
        const portfolioId = value.find((id) => props.portfolios.some((p) => p.portfolioId === id));
        const portfolio =
            portfolioId && props.portfolios.find((p) => p.portfolioId === portfolioId);
        const bookIds =
            portfolio === undefined
                ? (value as TPortfolioBookId[])
                : props.books.filter((b) => b.portfolioId === portfolioId).map((b) => b.bookId);

        props.onChangeBookIds(bookIds);
    });

    // TODO: uncomment when after MVP
    // const currentBoundTime = useMemo(() => {
    //     return props.currentBoundTime
    //         ? toDayjsWithTimezone(props.currentBoundTime, props.timeZone)
    //         : undefined;
    // }, [props.currentBoundTime, props.timeZone]);
    //
    // const handleCurrentBoundTimeChange = useFunction((value: null | Dayjs) => {
    //     props.onChangeBoundTime(isNil(value) ? undefined : toISO(value));
    // });

    return (
        <div>
            <Select<TPortfolioBookId[]>
                className={cnSelect}
                placeholder="Book"
                size="small"
                showSearch
                autoClearSearchValue
                mode="multiple"
                value={props.currentBookIds}
                options={portfolioBookOptions}
                onChange={handleBookIdChange}
            />

            {/*<DatePicker*/}
            {/*    style={{ width: 120 }}*/}
            {/*    size="small"*/}
            {/*    showTime*/}
            {/*    timeZone={props.timeZone}*/}
            {/*    value={currentBoundTime}*/}
            {/*    onChange={handleCurrentBoundTimeChange}*/}
            {/*/>*/}
        </div>
    );
}
