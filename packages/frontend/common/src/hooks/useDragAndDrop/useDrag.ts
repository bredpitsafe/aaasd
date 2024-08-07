import { isNil } from 'lodash-es';
import type { Ref } from 'react';
import { useEffect, useRef } from 'react';
import { EMPTY, fromEvent, merge, mergeMap, timeout } from 'rxjs';
import { catchError, filter, map, take, tap } from 'rxjs/operators';

import { receiveDragEvent$ } from './channel';
import { setCurrentAction } from './currentAction';
import type { TDragAction } from './def';
import { ESupportedMimeType, ETDragonActionType } from './def';

export type TDragStartData = {
    action: TDragAction;
    onEnd?: () => unknown;
    onFail?: VoidFunction;
    onSuccess?: VoidFunction;

    timeout?: number;
    onTimeout?: VoidFunction;
};
export function useDrag<Drag extends HTMLElement, Image extends HTMLElement>(
    startDrag?: (event: DragEvent) => undefined | TDragStartData,
): [Ref<Drag>, Ref<Image>] {
    const dragRef = useRef<Drag>(null);
    const dragImageRef = useRef<Image>(null);

    useEffect(() => {
        if (dragRef.current === null || isNil(startDrag)) {
            return;
        }

        const drag = dragRef.current;
        const image = dragImageRef.current;

        drag.setAttribute('draggable', 'true');
        drag.setAttribute('unselectable', 'on');
        // this is a hack for firefox
        // Firefox requires some kind of initialization
        // which we can do by adding this attribute
        // @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313

        const dragSubscribe = fromEvent<DragEvent>(drag, 'dragstart')
            .pipe(
                map((event) => {
                    if (event.dataTransfer === null) return undefined;

                    const startData = startDrag(event);

                    if (startData === undefined) return undefined;

                    return { event, startData };
                }),
                filter(
                    (
                        data,
                    ): data is {
                        event: DragEvent;
                        startData: TDragStartData;
                    } => data !== undefined,
                ),
                tap(({ event, startData }) => {
                    setCurrentAction(startData.action);

                    event.dataTransfer!.setData(
                        ESupportedMimeType.DragAction,
                        JSON.stringify(startData.action),
                    );

                    if (image !== null) {
                        const dragRect = drag.getBoundingClientRect();
                        const imageRect = image.getBoundingClientRect();

                        event.dataTransfer?.setDragImage(
                            image,
                            window.devicePixelRatio * (dragRect.x - imageRect.x),
                            window.devicePixelRatio * (dragRect.y - imageRect.y),
                        );
                    }
                }),
                mergeMap(({ startData }) =>
                    merge(
                        fromEvent<DragEvent>(drag, 'dragend').pipe(
                            take(1),
                            tap(() => {
                                startData.onEnd?.();
                                setCurrentAction(undefined);
                            }),
                        ),
                        receiveDragEvent$.pipe(
                            filter((action) => action.payload === startData.action.id),
                            tap((action) => {
                                action.type === ETDragonActionType.Fail
                                    ? startData.onFail?.()
                                    : startData.onSuccess?.();
                            }),
                            timeout(startData.timeout ?? 5_000),
                            catchError(() => {
                                startData.onTimeout?.();
                                return EMPTY;
                            }),
                        ),
                    ),
                ),
            )
            .subscribe();

        return () => {
            drag.removeAttribute('draggable');
            drag.removeAttribute('unselectable');
            dragSubscribe.unsubscribe();
        };
    }, [startDrag]);

    return [dragRef, dragImageRef];
}
