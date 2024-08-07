import type { ColumnState } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { createObservableBox } from '../../utils/rx';
import type { ETableIds, TTableId } from '../clientTableFilters/data';
import { removeTableState, upsertTableState } from './utils';

export type TTableState = {
    id: ETableIds | TTableId;
    columns: ColumnState[];
    userResized?: boolean;
};

export type TTableStatesMap = Partial<Record<ETableIds | TTableId, TTableState>>;

export const boxTableStates = createObservableBox<TTableStatesMap | undefined>(undefined);

export function getState$(id: ETableIds | TTableId): Observable<TTableState | undefined> {
    return boxTableStates.obs.pipe(
        filter((stateMap): stateMap is TTableStatesMap => !isNil(stateMap)),
        map((stateMap) => stateMap[id]),
    );
}

export function upsertState(id: ETableIds | TTableId, columns: ColumnState[]): void {
    upsertTableState({
        id,
        columns,
    });
}

export function setUserResizedState(id: ETableIds | TTableId, userResized: boolean): void {
    upsertTableState({
        id,
        userResized,
    });
}

export function dropState(id: ETableIds | TTableId): void {
    removeTableState(id);
}
