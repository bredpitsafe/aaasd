import { BehaviorSubject } from 'rxjs';

import { receiveFromTabs, sendToTabs } from '../../utils/Rx/syncBetweenTabs';
import { TDragAction } from './def';

const CHANNEL = 'CURRENT_DRAG_ACTION';
const currentAction$ = new BehaviorSubject<undefined | TDragAction>(undefined);

export const setCurrentAction = (v: undefined | TDragAction): void => {
    v?.id !== currentAction$.value?.id && currentAction$.next(v);
};
export const getCurrentAction = (): undefined | TDragAction => currentAction$.value;

receiveFromTabs<TDragAction>(CHANNEL).subscribe(setCurrentAction);
currentAction$.pipe(sendToTabs(CHANNEL)).subscribe();
