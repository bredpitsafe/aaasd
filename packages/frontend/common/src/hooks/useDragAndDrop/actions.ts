import { mergeMap, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { getRandomInt32 } from '../../utils/random';
import { throwingError } from '../../utils/throwingError';
import {
    ESupportedMimeType,
    ETDragonActionType,
    ExtractAction,
    TDragAction,
    TDragActionID,
} from './def';

export function isDragAction(some: object): some is TDragAction {
    return 'id' in some && 'type' in some && 'payload' in some;
}

export function createDragAction<E extends ETDragonActionType>(
    type: E,
    payload: ExtractAction<TDragAction, E>['payload'],
): ExtractAction<TDragAction, E> {
    return {
        id: getRandomInt32() as TDragActionID,
        type,
        payload,
    } as ExtractAction<TDragAction, E>;
}

export function extractDragAction$(dataTransfer: DataTransferItem): Observable<TDragAction> {
    return tryExtractDragAction$(dataTransfer).pipe(
        catchError(() => of(createDragAction(ETDragonActionType.Native, dataTransfer))),
    );
}

function tryExtractDragAction$(dataTransfer: DataTransferItem): Observable<TDragAction> {
    return of(dataTransfer).pipe(
        map((data) =>
            data.type === ESupportedMimeType.DragAction
                ? data
                : throwingError(new Error(`Wrong type`)),
        ),
        mergeMap((data) => new Promise<string>((r) => data.getAsString(r))),
        map((string) => JSON.parse(string) as object),
        map((object) =>
            isDragAction(object)
                ? object
                : throwingError(new Error('Could not extract custom drag action')),
        ),
    );
}
