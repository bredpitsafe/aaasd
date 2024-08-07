import { from, fromEvent, merge, of } from 'rxjs';
import { distinctUntilChanged, shareReplay, startWith } from 'rxjs/operators';

import { isWindow } from '../detect';

const isVisible = () => self.document.visibilityState === 'visible';

export const documentVisibilityState$ = (() => {
    return isWindow
        ? merge(
              fromEvent(self, 'visibilitychange', isVisible),
              from(new Promise<boolean>((res) => requestAnimationFrame(() => res(isVisible())))),
          ).pipe(startWith(isVisible()), distinctUntilChanged(), shareReplay(1))
        : of(true).pipe(shareReplay(1));
})();
