import { sortBy } from 'lodash-es';
import { EMPTY, Observable } from 'rxjs';

import { TContextRef } from '../di';
import {
    EComponentType,
    TComponentTypeToType,
    TComponentTypeToTypeId,
} from '../types/domain/component';
import { TGateId } from '../types/domain/gates';
import { TRobotId } from '../types/domain/robots';
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
