import type { ColumnState } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { createObservableBox } from '../../utils/rx';
import type { ETableIds } from '../clientTableFilters/data';
import { removeTableState, upsertTableState } from './utils';

export type TTableState = {
    id: ETableIds;
    columns: ColumnState[];
    userResized?: boolean;
};

export type TTableStatesMap = Partial<Record<ETableIds, TTableState>>;

export const boxTableStates = createObservableBox<TTableStatesMap | undefined>(undefined);

export function getState$(id: ETableIds): Observable<TTableState | undefined> {
    return boxTableStates.obs.pipe(
        filter((stateMap): stateMap is TTableStatesMap => !isNil(stateMap)),
        map((stateMap) => stateMap[id]),
    );
}

export function upsertState(id: ETableIds, columns: ColumnState[]): void {
    upsertTableState({
        id,
        columns,
    });
}

export function setUserResizedState(id: ETableIds, userResized: boolean): void {
    upsertTableState({
        id,
        userResized,
    });
}

export function dropState(id: ETableIds): void {
    removeTableState(id);
}
