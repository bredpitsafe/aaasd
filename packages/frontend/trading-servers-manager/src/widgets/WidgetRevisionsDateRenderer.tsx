import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ISO, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { assertNever, toDayjsWithTimezone } from '@common/utils';
import { cnLink } from '@frontend/common/src/components/Link/index.css.ts';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { memo } from 'react';

import { EDefaultLayoutComponents } from '../layouts/default.tsx';
import { useShowInstrumentsRevisions } from './hooks/useShowInstrumentsRevisions.ts';
import { useShowProviderInstrumentsRevisions } from './hooks/useShowProviderInstrumentsRevisions.ts';

export const WidgetRevisionsDateRenderer = memo(
    ({
        instrument,
        date,
        timeZone,
        tab,
    }: {
        instrument: TInstrument;
        date: ISO;
        timeZone: TimeZone;
        tab:
            | EDefaultLayoutComponents.InstrumentRevisions
            | EDefaultLayoutComponents.ProviderInstrumentRevisions;
    }) => {
        const showInstrumentsRevisions = useShowInstrumentsRevisions();
        const showProviderInstrumentsRevisions = useShowProviderInstrumentsRevisions();

        const showRevisions = useFunction(() => {
            switch (tab) {
                case EDefaultLayoutComponents.InstrumentRevisions:
                    return showInstrumentsRevisions([instrument]);
                case EDefaultLayoutComponents.ProviderInstrumentRevisions:
                    return showProviderInstrumentsRevisions([instrument]);
                default:
                    assertNever(tab);
            }
        });

        return (
            <Tooltip title={`Show revisions`}>
                <a className={cnLink} onClick={showRevisions}>
                    {toDayjsWithTimezone(date, timeZone).format(EDateTimeFormats.DateTime)}
                </a>
            </Tooltip>
        );
    },
);
