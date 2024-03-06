import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { EApplicationName } from '@frontend/common/src/types/app';
import { TPortfolio, TPortfolioBook } from '@frontend/common/src/types/domain/portfolioTraсker';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';

import { ModulePortfolioTrackerActions } from '../../../modules/actions/module';
import { ModulePortfolioTrackerObservables } from '../../../modules/observables/module';
import { PortfolioFilter } from '../../PortfolioFilter/view';

export function ConnectedPortfolioFilter() {
    const { activeBookIds$, books$, portfolios$ } = useModule(ModulePortfolioTrackerObservables);
    const { setActiveBookIds } = useModule(ModulePortfolioTrackerActions);

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.PortfolioTracker);
    const books = useSyncObservable(books$) ?? (EMPTY_ARRAY as TPortfolioBook[]);
    const portfolios = useSyncObservable(portfolios$) ?? (EMPTY_ARRAY as TPortfolio[]);
    const bookId = useSyncObservable(activeBookIds$);
    // const boundTime = useSyncObservable(boundTime$);

    return (
        <PortfolioFilter
            timeZone={timeZone}
            portfolios={portfolios}
            books={books}
            currentBookIds={bookId}
            // currentBoundTime={boundTime}
            onChangeBookIds={setActiveBookIds}
            // onChangeBoundTime={setBoundTime}
        />
    );
}
