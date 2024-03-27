import type { TUseInfinityDataSourceProps } from '@frontend/common/src/components/AgTable/hooks/useInfinityDataSource';
import type { TUseScrollCallbacksProps } from '@frontend/common/src/components/AgTable/hooks/useScrollCallbacks';
import type { TOwnTrade, TOwnTradeFilter } from '@frontend/common/src/types/domain/ownTrades';
import type { CalendarDate, Milliseconds, TimeZone } from '@frontend/common/src/types/time';

export type TTradesTableFullProps = TUseInfinityDataSourceProps<TOwnTrade, TOwnTradeFilter> &
    TUseScrollCallbacksProps & {
        updateTime: undefined | Milliseconds;
        timeZone: TimeZone;
        exportFilename: string;
        since: CalendarDate;
        till: CalendarDate;
    };
