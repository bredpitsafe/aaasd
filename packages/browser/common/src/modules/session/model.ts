import { isEqual } from 'lodash-es';
import { distinctUntilChanged, ReplaySubject, shareReplay } from 'rxjs';

import { TUser } from '../user';
import { TSession } from './domain';

export const sessionIn$ = new ReplaySubject<TSession>(1);
export const sessionOut$ = sessionIn$.pipe(distinctUntilChanged(isEqual), shareReplay(1));

export const tokenIn$ = new ReplaySubject<string | null>(1);
export const tokenOut$ = tokenIn$.pipe(distinctUntilChanged(), shareReplay(1));

export const userIn$ = new ReplaySubject<TUser | null>(1);
export const userOut$ = userIn$.pipe(distinctUntilChanged(), shareReplay(1));
