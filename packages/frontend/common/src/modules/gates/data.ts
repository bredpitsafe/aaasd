import { omit } from 'lodash-es';
import memoize from 'memoizee';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Unopaque } from '../../types';
import { TGate, TGateId } from '../../types/domain/gates';
import { createObservableBox } from '../../utils/rx';
import { unopaque } from '../../utils/unopaque';
import { sortByName } from '../utils';

const boxGates = createObservableBox<Record<Unopaque<TGateId>, TGate>>({});

export const gates$ = boxGates.obs;

export const getGate$ = memoize(
    (id?: TGateId): Observable<TGate | undefined> => {
        return boxGates.obs.pipe(map((gates) => (id ? gates[id] : undefined)));
    },
    { primitive: true, max: 100 },
);

export const upsertGates = (gates: TGate[]): void => {
    boxGates.set((prev) => ({
        ...prev,
        ...gates.reduce(
            (accum, gate: TGate) => {
                accum[unopaque(gate.id)] = gate;
                return accum;
            },
            {} as Record<Unopaque<TGateId>, TGate>,
        ),
    }));
};

export const deleteGates = (gateIds?: TGateId[]): void => {
    if (gateIds) {
        boxGates.set((prev) => omit(prev, gateIds));
    } else {
        boxGates.set({});
    }
};

export const getGate = (id: TGateId): TGate | undefined => {
    return boxGates.get()[id];
};

export const getGates = (ids: TGateId[]): TGate[] => {
    const map = boxGates.get();

    return sortByName(ids.map((id) => map[id]).filter((gate) => gate !== undefined));
};

export const getGates$ = (ids?: TGateId[]): Observable<TGate[] | undefined> => {
    return boxGates.obs.pipe(
        map(
            (gates) =>
                ids?.map((id) => gates[id]).filter((gate): gate is TGate => gate !== undefined),
        ),
    );
};

export const { obs: gatesRemovable$, set: enableGatesRemoval } = createObservableBox(false);
