import { receiveFromTabs, sendToTabs } from '@common/rx';
import { merge, Subject } from 'rxjs';

import type { TDragFailAction, TDragSuccessAction } from './def';

export const sendDragEvent$ = new Subject<TDragFailAction | TDragSuccessAction>();
export const receiveDragEvent$ = merge(
    sendDragEvent$,
    receiveFromTabs<TDragFailAction | TDragSuccessAction>('DRAG_EVENTS'),
);

sendDragEvent$.pipe(sendToTabs('DRAG_EVENTS')).subscribe();
