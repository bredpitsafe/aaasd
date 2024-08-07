import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings.ts';

import { TableTransposeInstrumentDetails } from '../../components/Tables/TableTransposeInstrumentDetails/view.tsx';
import { ETradingServersManagerRouteParams } from '../../modules/router/defs.ts';
import { useFullInstruments } from '../hooks/useFullInstruments.ts';
import { useRouteInstruments } from '../hooks/useRouteInstruments.ts';
import { useShowInstrumentsRevisions } from '../hooks/useShowInstrumentsRevisions.ts';
import { useShowProviderInstrumentsDetails } from '../hooks/useShowProviderInstrumentsDetails.ts';

export function WidgetInstrumentDetails() {
    const { instrumentsIds, removeInstrument } = useRouteInstruments(
        ETradingServersManagerRouteParams.InstrumentsList,
    );

    const instruments = useFullInstruments(instrumentsIds);

    const [{ timeZone }] = useTimeZoneInfoSettings();

    const showProviderInstrumentsDetails = useShowProviderInstrumentsDetails();
    const showInstrumentsRevisions = useShowInstrumentsRevisions();

    return (
        <TableTransposeInstrumentDetails
            fullInstrumentsDesc={instruments}
            timeZone={timeZone}
            onRemoveInstrument={removeInstrument}
            showProviderInstrumentsDetails={showProviderInstrumentsDetails}
            showInstrumentsRevisions={showInstrumentsRevisions}
        />
    );
}
