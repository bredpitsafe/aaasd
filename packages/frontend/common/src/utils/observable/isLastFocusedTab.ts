import { receiveFromTabs, sendToTabs } from '@common/rx';
import { EMPTY, from, fromEvent, merge } from 'rxjs';
import { distinctUntilChanged, mapTo, shareReplay, startWith } from 'rxjs/operators';

const CHANNEL = 'lastFocusedTab';

const tabFocused$ = merge(
    document.hasFocus() ? from([true]) : EMPTY,
    fromEvent(window, 'focus'),
    fromEvent(document, 'click'),
    fromEvent(document, 'keypress'),
).pipe(mapTo(true), sendToTabs(CHANNEL));

const tabUnfocused$ = receiveFromTabs(CHANNEL).pipe(mapTo(false));

export const isLastFocusedTab$ = merge(tabFocused$, tabUnfocused$).pipe(
    startWith(false),
    distinctUntilChanged(),
    shareReplay(1),
);
