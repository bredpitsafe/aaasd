import { receiveFromTabs, sendToTabs } from '@common/rx';
import { fromEvent, merge, of } from 'rxjs';
import {
    delay,
    distinctUntilChanged,
    mapTo,
    shareReplay,
    startWith,
    switchMap,
} from 'rxjs/operators';

const CHANNEL = 'lastActiveTab';

const tabActive$ = merge(
    fromEvent(window, 'focus'),
    fromEvent(document, 'click'),
    fromEvent(document, 'keypress'),
    fromEvent(document, 'wheel'),
    fromEvent(document, 'mouseenter'),
    fromEvent(document, 'mouseover'),
).pipe(mapTo(true), sendToTabs(CHANNEL));

const tabInactive$ = receiveFromTabs(CHANNEL).pipe(mapTo(false));

export const isLastActiveTab$ = merge(tabActive$, tabInactive$).pipe(
    startWith(!document.hidden),
    distinctUntilChanged(),
    shareReplay(1),
);

export const isLastActiveTabWithDelay$ = isLastActiveTab$.pipe(
    switchMap((value) => (value ? of(value) : of(false).pipe(delay(500)))),
    distinctUntilChanged(),
    shareReplay(1),
);
