import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings.ts';

import { TableTransposeProviderInstrumentRevisions } from '../../components/Tables/TableTransposeProviderInstrumentRevisions/view.tsx';
import { ETradingServersManagerRouteParams } from '../../modules/router/defs.ts';
import { useInstrumentRevisions } from '../hooks/useInstrumentRevisions.ts';
import { useInstrumentsWithRevisions } from '../hooks/useInstrumentsWithRevisions.ts';
import { useRouteRevisionInstruments } from '../hooks/useRouteRevisionInstruments.ts';

export function WidgetProviderInstrumentRevisions() {
    const { revisionInstrumentsIds, removeInstrument, setInstrumentRevisions } =
        useRouteRevisionInstruments(
            ETradingServersManagerRouteParams.RevisionProviderInstrumentsList,
        );

    const [{ timeZone }] = useTimeZoneInfoSettings();

    const revisions = useInstrumentRevisions(revisionInstrumentsIds);
    const instruments = useInstrumentsWithRevisions(revisionInstrumentsIds);

    return (
        <TableTransposeProviderInstrumentRevisions
            revisionInstrumentsIds={revisionInstrumentsIds}
            timeZone={timeZone}
            revisionsDesc={revisions}
            instrumentsDesc={instruments}
            onRemoveInstrument={removeInstrument}
            onSetInstrumentRevisions={setInstrumentRevisions}
        />
    );
}
