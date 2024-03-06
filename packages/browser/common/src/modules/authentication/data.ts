import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import type { Socket } from '../../lib/Socket/Socket';
import { createObservableBox } from '../../utils/rx';
import { logger as defaultLogger } from '../../utils/Tracing';
import { Binding } from '../../utils/Tracing/Children/Binding';

export enum ESocketAuthenticationState {
    NotAuthenticated = 'NotAuthenticated',
    Authenticating = 'Authenticating',
    Authenticated = 'Authenticated',
    Failed = 'Failed',
}

type TsocketStatesMap = WeakMap<Socket, ESocketAuthenticationState>;
const boxAuthenticatedSockets = createObservableBox<TsocketStatesMap>(new WeakMap());

export const logger = defaultLogger.child(new Binding('AuthenticationPlugin'));

export const setAuthenticationSocketState = (socket: Socket, value: ESocketAuthenticationState) =>
    boxAuthenticatedSockets.set((state) => {
        state.set(socket, value);
        logger.info(`update auth state to '${value}', socket:`, socket.url.pathname);
        return state;
    });
export const isAuthenticatedSocket$ = (socket: Socket): Observable<ESocketAuthenticationState> =>
    boxAuthenticatedSockets.obs.pipe(
        map((set) => set.get(socket) ?? ESocketAuthenticationState.NotAuthenticated),
        distinctUntilChanged(),
    );
