import { isEqual, omit } from 'lodash-es';

import type { ETableIds, TTableId } from '../clientTableFilters/data';
import type { TTableState } from './data';
import { boxTableStates } from './data';

type TUpsertTableState = Partial<TTableState> & Pick<TTableState, 'id'>;

export function upsertTableState(state: TUpsertTableState): void {
    const tableState = boxTableStates.get()?.[state.id];
    const newTableState = { ...tableState, ...state };

    if (!isEqual(tableState, newTableState)) {
        boxTableStates.set({
            ...boxTableStates.get(),
            [state.id]: { ...tableState, ...state },
        });
    }
}

export function removeTableState(id: ETableIds | TTableId): void {
    boxTableStates.set(omit(boxTableStates.get(), id));
}
