import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings.ts';

import { TableTransposeProviderInstrumentDetails } from '../../components/Tables/TableTransposeProviderInstrumentDetails/view.tsx';
import { ETradingServersManagerRouteParams } from '../../modules/router/defs.ts';
import { useInstruments } from '../hooks/useInstruments.ts';
import { useRouteInstruments } from '../hooks/useRouteInstruments.ts';
import { useShowProviderInstrumentsRevisions } from '../hooks/useShowProviderInstrumentsRevisions.ts';
import { useUpdateProviderInstrumentsOverride } from '../hooks/useUpdateProviderInstrumentsOverride.tsx';

export function WidgetProviderInstrumentDetails() {
    const { instrumentsIds, removeInstrument } = useRouteInstruments(
        ETradingServersManagerRouteParams.OverrideInstrumentsList,
    );

    const instruments = useInstruments(instrumentsIds);

    const [{ timeZone }] = useTimeZoneInfoSettings();

    const updateProviderInstrumentsOverride = useUpdateProviderInstrumentsOverride();
    const showProviderInstrumentsRevisions = useShowProviderInstrumentsRevisions();

    return (
        <TableTransposeProviderInstrumentDetails
            instrumentsDesc={instruments}
            timeZone={timeZone}
            updateProviderInstrumentsOverride={updateProviderInstrumentsOverride}
            showProviderInstrumentsRevisions={showProviderInstrumentsRevisions}
            onRemoveInstrument={removeInstrument}
        />
    );
}
