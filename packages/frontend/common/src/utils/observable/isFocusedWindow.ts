import { fromEvent, merge } from 'rxjs';
import { distinctUntilChanged, mapTo, shareReplay, startWith } from 'rxjs/operators';

export const isFocusedWindow$ = merge(
    fromEvent(window, 'blur').pipe(mapTo(false)),
    fromEvent(window, 'focus').pipe(mapTo(true)),
).pipe(startWith(document.visibilityState === 'visible'), distinctUntilChanged(), shareReplay(1));
