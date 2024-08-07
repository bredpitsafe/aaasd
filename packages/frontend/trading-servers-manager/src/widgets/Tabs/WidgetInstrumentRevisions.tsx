import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings.ts';

import { TableTransposeInstrumentRevisions } from '../../components/Tables/TableTransposeInstrumentRevisions/view.tsx';
import { ETradingServersManagerRouteParams } from '../../modules/router/defs.ts';
import { useInstrumentRevisions } from '../hooks/useInstrumentRevisions.ts';
import { useInstrumentsWithRevisions } from '../hooks/useInstrumentsWithRevisions.ts';
import { useRouteRevisionInstruments } from '../hooks/useRouteRevisionInstruments.ts';

export function WidgetInstrumentRevisions() {
    const {
        revisionInstrumentsIds,
        removeInstrument,
        removeInstrumentRevision,
        setInstrumentRevisions,
    } = useRouteRevisionInstruments(ETradingServersManagerRouteParams.RevisionInstrumentsList);

    const [{ timeZone }] = useTimeZoneInfoSettings();

    const revisions = useInstrumentRevisions(revisionInstrumentsIds);
    const instruments = useInstrumentsWithRevisions(revisionInstrumentsIds);

    return (
        <TableTransposeInstrumentRevisions
            revisionInstrumentsIds={revisionInstrumentsIds}
            timeZone={timeZone}
            revisionsDesc={revisions}
            instrumentsDesc={instruments}
            onRemoveInstrument={removeInstrument}
            onRemoveInstrumentRevision={removeInstrumentRevision}
            onSetInstrumentRevisions={setInstrumentRevisions}
        />
    );
}
