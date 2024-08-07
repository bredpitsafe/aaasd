import { fromEvent, share } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

export function createZoomSwitcher$(element: HTMLElement, triggerGap = 100) {
    const move$ = fromEvent<MouseEvent>(element, 'mousemove').pipe(
        map((e) => [e, element.getBoundingClientRect()] as [MouseEvent, DOMRect]),
        share(),
    );
    const zoomOnlyX$ = move$.pipe(
        map(([{ offsetY }, { height }]) => offsetY > height - triggerGap),
        distinctUntilChanged(),
    );
    const zoomOnlyY$ = move$.pipe(
        map(([{ offsetX }, { width }]) => offsetX < triggerGap || offsetX > width - triggerGap),
        distinctUntilChanged(),
    );

    return { zoomOnlyX$, zoomOnlyY$ };
}
