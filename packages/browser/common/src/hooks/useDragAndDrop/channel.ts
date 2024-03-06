import { merge, Subject } from 'rxjs';

import { receiveFromTabs, sendToTabs } from '../../utils/Rx/syncBetweenTabs';
import { TDragFailAction, TDragSuccessAction } from './def';

export const sendDragEvent$ = new Subject<TDragFailAction | TDragSuccessAction>();
export const receiveDragEvent$ = merge(
    sendDragEvent$,
    receiveFromTabs<TDragFailAction | TDragSuccessAction>('DRAG_EVENTS'),
);

sendDragEvent$.pipe(sendToTabs('DRAG_EVENTS')).subscribe();
