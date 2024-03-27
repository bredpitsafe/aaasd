import { omit } from 'lodash-es';

import type { ETableIds } from '../clientTableFilters/data';
import { boxTableStates, TTableState } from './data';

type TUpsertTableState = Partial<TTableState> & Pick<TTableState, 'id'>;
export function upsertTableState(state: TUpsertTableState): void {
    const tableState = boxTableStates.get()?.[state.id];
    boxTableStates.set({
        ...boxTableStates.get(),
        [state.id]: { ...tableState, ...state },
    });
}

export function removeTableState(id: ETableIds): void {
    boxTableStates.set(omit(boxTableStates.get(), id));
}
