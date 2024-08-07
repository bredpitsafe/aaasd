import { useEffect } from 'react';
import { useCounter, useEvent } from 'react-use';
import type { Observable } from 'rxjs';
import { EMPTY, from, mergeMap, of } from 'rxjs';
import { filter } from 'rxjs/operators';

import { useFunction } from '../../utils/React/useFunction';
import { throwingError } from '../../utils/throwingError';
import { createDragAction, extractDragAction$ } from './actions';
import { sendDragEvent$ } from './channel';
import { getCurrentAction } from './currentAction';
import type { ESupportedMimeType, TDragAction } from './def';
import { ETDragonActionType, SupportedMimeTypes } from './def';

type TProps = {
    filter?: (event: DragEvent, action?: TDragAction) => boolean;
    onDrop: (action: TDragAction) => void | boolean | Promise<boolean>;
    onDropStateChange?(dropping: boolean): void;
};

export function useDrop(props: TProps): void {
    const [dropCount, { inc, dec, reset }] = useCounter(0);
    const { onDropStateChange } = props;

    useEffect(() => {
        onDropStateChange?.(dropCount > 0);
    }, [onDropStateChange, dropCount]);

    const selectDragEvent$ = useFunction((event: DragEvent): Observable<DragEvent> => {
        const item = event.dataTransfer?.items[0];

        if (item === undefined) {
            return EMPTY;
        }

        if (!SupportedMimeTypes.has(item.type as ESupportedMimeType)) {
            return throwingError(new Error(`Unsupported type`));
        }

        return of(event).pipe(
            filter((event) => {
                return typeof props.filter === 'function'
                    ? props.filter(event, getCurrentAction())
                    : true;
            }),
        );
    });

    const selectDragAction$ = useFunction((event: DragEvent): Observable<TDragAction> => {
        return selectDragEvent$(event).pipe(
            mergeMap((event) => {
                return event.dataTransfer?.items[0] === undefined
                    ? EMPTY
                    : from(event.dataTransfer.items);
            }),
            mergeMap(extractDragAction$),
        );
    });

    const cbDragEnter = useFunction((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        selectDragEvent$(e).subscribe(() => inc());
    });

    const cbDragLeave = useFunction((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        selectDragEvent$(e).subscribe(() => dec());
    });

    const cbDragOver = useFunction((e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    const cbDrop = useFunction((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        reset();

        selectDragAction$(e)
            .pipe(
                mergeMap(async (action) => {
                    const response = await props.onDrop(action);
                    return { action, state: response === true };
                }),
            )
            .subscribe(({ action, state }) =>
                sendDragEvent$.next(
                    createDragAction(
                        state ? ETDragonActionType.Success : ETDragonActionType.Fail,
                        action.id,
                    ),
                ),
            );
    });

    useEvent('dragenter', cbDragEnter);
    useEvent('dragleave', cbDragLeave);
    useEvent('dragover', cbDragOver);
    useEvent('drop', cbDrop);
}
