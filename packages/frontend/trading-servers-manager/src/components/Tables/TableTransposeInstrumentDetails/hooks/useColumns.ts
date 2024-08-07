import type { TimeZone } from '@common/types';
import type { ColDef } from '@frontend/ag-grid';
import { useDeepEqualProp } from '@frontend/common/src/hooks/useDeepEqualProp.ts';
import { useMemo } from 'react';

import { EDefaultLayoutComponents } from '../../../../layouts/default.tsx';
import { CellValueRenderer } from '../../CellValueRenderer.tsx';
import type { TFullInstrument, TPropertyRow } from '../../defs.ts';
import { InstrumentHeader } from '../../InstrumentHeader.tsx';
import { getPropertyCellValueFormatter } from '../../utils/instruments.ts';
import { cnPinnedHeaderColumns } from '../styles.css.ts';
import { getPackedInstrumentColumnsNames } from '../utils.ts';

export function useColumns(
    fullInstruments: TFullInstrument[],
    timeZone: TimeZone,
    removeInstrument: (instrumentId: number) => void,
): ColDef<TPropertyRow>[] {
    const instrumentIds = useDeepEqualProp(
        useMemo(() => getPackedInstrumentColumnsNames(fullInstruments), [fullInstruments]),
    );

    return useMemo(
        () =>
            [
                {
                    field: 'group',
                    rowGroup: true,
                    rowGroupIndex: 1,
                    hide: true,
                    maxWidth: 150,
                },
                {
                    field: 'property',
                    headerName: 'Property',
                    pinned: 'left',
                    cellClass: cnPinnedHeaderColumns,
                },
                ...instrumentIds.map(({ id, name, field }) => ({
                    field,
                    headerName: `${id} | ${name}`,
                    headerComponent: InstrumentHeader,
                    headerComponentParams: {
                        removeInstrument: removeInstrument.bind(undefined, id),
                    },
                    cellRenderer: CellValueRenderer,
                    cellRendererParams: {
                        timeZone,
                        revisionsTab: EDefaultLayoutComponents.InstrumentRevisions,
                    },
                    valueFormatter: getPropertyCellValueFormatter(timeZone),
                    useValueFormatterForExport: true,
                    suppressMovable: false,
                })),
            ] as ColDef<TPropertyRow>[],
        [instrumentIds, timeZone, removeInstrument],
    );
}
