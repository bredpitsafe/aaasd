import type { CalendarDate, Milliseconds, TimeZone } from '@common/types';
import type { TUseInfinityDataSourceProps } from '@frontend/common/src/components/AgTable/hooks/useInfinityDataSource';
import type { TUseScrollCallbacksProps } from '@frontend/common/src/components/AgTable/hooks/useScrollCallbacks';
import type { TOwnTrade, TOwnTradeFilter } from '@frontend/common/src/types/domain/ownTrades';

export type TTradesTableFullProps = TUseInfinityDataSourceProps<TOwnTrade, TOwnTradeFilter> &
    TUseScrollCallbacksProps & {
        updateTime: undefined | Milliseconds;
        timeZone: TimeZone;
        exportFilename: string;
        since: CalendarDate;
        till: CalendarDate;
    };
