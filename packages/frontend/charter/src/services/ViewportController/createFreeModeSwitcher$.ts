import { fromEvent, merge } from 'rxjs';
import { distinctUntilChanged, filter, mapTo } from 'rxjs/operators';

export function createFreeModeSwitcher(element: HTMLElement) {
    const enable$ = merge(
        fromEvent<MouseEvent>(element, 'mousedown'),
        fromEvent<MouseEvent>(element, 'wheel'),
    ).pipe(
        filter((e) => e.shiftKey),
        mapTo(true),
    );
    const disable$ = merge(fromEvent<MouseEvent>(element, 'dblclick')).pipe(mapTo(false));

    return merge(enable$, disable$).pipe(distinctUntilChanged());
}
