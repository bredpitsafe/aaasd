import type { Subject } from 'rxjs';
import { ReplaySubject } from 'rxjs';

import { createLocalState } from '../../Charter/methods';
import { EVirtualViewport } from '../../components/ChartViewport/defs';
import type { IContext } from '../../types';
import type { TMinMax } from './defs';

export class DisplayZeroController {
    private readonly state: {
        displayZero: Record<EVirtualViewport, boolean>;
    };

    public update$: Subject<void>;

    constructor(ctx: IContext) {
        this.state = createLocalState(
            ctx,
            'DisplayZeroController',
            (state) =>
                state ?? {
                    displayZero: {
                        [EVirtualViewport.left]: false,
                        [EVirtualViewport.right]: false,
                    },
                },
        );
        this.update$ = new ReplaySubject<void>(1);

        // combineLatestWith requires that all Observables must fire at least once
        // before the result observable is produced
        this.update$.next();
    }

    toggleDisplayZero(axis: EVirtualViewport, value?: boolean): boolean {
        this.state.displayZero[axis] = value !== undefined ? value : !this.state.displayZero[axis];
        this.update$.next();
        return this.state.displayZero[axis];
    }

    modifyMinMax(axis: EVirtualViewport, minMax: TMinMax): TMinMax {
        return this.state.displayZero[axis] ? displayZeroInMinMax(minMax) : minMax;
    }
}

function displayZeroInMinMax(source: TMinMax): TMinMax {
    if (source[0] > 0) {
        return [0, source[1]];
    }

    if (source[1] < 0) {
        return [source[0], 0];
    }

    return source;
}
