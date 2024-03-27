import { sortBy } from 'lodash-es';
import { defer, EMPTY, from, MonoTypeOperatorFunction, Observable, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import type { TContextRef } from '../di';
import {
    EComponentType,
    TComponentTypeToType,
    TComponentTypeToTypeId,
} from '../types/domain/component';
import type { TGateId } from '../types/domain/gates';
import type { TRobotId } from '../types/domain/robots';
import { assertNever } from '../utils/assert.ts';
import { ModuleGates } from './gates';
import { ModuleRobots } from './robots';

export function getComponent<
    T extends EComponentType,
    ID extends TComponentTypeToTypeId[T],
    R extends TComponentTypeToType[T],
>(ctx: TContextRef, type: T, id: ID): R | void {
    const { getGate } = ModuleGates(ctx);
    const { getRobot } = ModuleRobots(ctx);

    switch (type) {
        case EComponentType.robot:
            return getRobot(id as TRobotId) as R | void;
        case EComponentType.mdGate:
        case EComponentType.execGate:
            return getGate(id as TGateId) as R | void;
    }
}
export function getComponent$<
    T extends EComponentType,
    ID extends TComponentTypeToTypeId[T],
    R extends TComponentTypeToType[T],
>(ctx: TContextRef, type: T, id: ID): Observable<R | void> {
    const { getGate$ } = ModuleGates(ctx);
    const { getRobot$ } = ModuleRobots(ctx);

    switch (type) {
        case EComponentType.robot:
            return getRobot$(id as TRobotId) as Observable<R | void>;
        case EComponentType.mdGate:
        case EComponentType.execGate:
            return getGate$(id as TGateId) as Observable<R | void>;
    }

    return EMPTY;
}

export function sortByName<T extends { name: string }>(arr: T[]): T[] {
    return sortBy(arr, (item) => item.name.toLowerCase());
}

export enum EDelayEmitType {
    Delay,
    PassThrough,
    Pass,
}

export function delayEmit<T>(condition: (value: T) => EDelayEmitType): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>): Observable<T> =>
        defer(() => {
            const buffer: T[] = [];
            const opened = false;

            return source.pipe(
                concatMap((value): Observable<T> => {
                    if (opened) {
                        return of(value);
                    }

                    const emitType = condition(value);

                    switch (emitType) {
                        case EDelayEmitType.Delay:
                            buffer.push(value);
                            return EMPTY;
                        case EDelayEmitType.PassThrough:
                            return of(value);
                        case EDelayEmitType.Pass:
                            const newBuffer = [value, ...buffer];
                            buffer.length = 0;
                            return from(newBuffer);
                        default:
                            assertNever(emitType);
                    }
                }),
            );
        });
}
