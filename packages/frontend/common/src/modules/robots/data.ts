import { omit } from 'lodash-es';
import memoize from 'memoizee';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Unopaque } from '../../types';
import { TRobot, TRobotId } from '../../types/domain/robots';
import { isHerodotus } from '../../utils/domain/isHerodotus';
import { createObservableBox } from '../../utils/rx';
import { unopaque } from '../../utils/unopaque';
import { sortByName } from '../utils';

export const boxRobots = createObservableBox<Record<Unopaque<TRobotId>, TRobot>>({});
export const boxRobotsLoading = createObservableBox<boolean>(false);
export const upsertRobots = (robots: TRobot[]): void => {
    boxRobots.set((prevRobots) => ({
        ...prevRobots,
        ...robots.reduce(
            (accum, robot: TRobot) => {
                accum[unopaque(robot.id)] = robot;
                return accum;
            },
            {} as Record<Unopaque<TRobotId>, TRobot>,
        ),
    }));
};
export const deleteRobots = (gateIds?: TRobotId[]): void => {
    if (gateIds) {
        boxRobots.set((prevRobots) => omit(prevRobots, gateIds));
    } else {
        boxRobots.set({});
    }
};
export const getRobot$ = memoize(
    (id?: TRobotId): Observable<TRobot | undefined> => {
        return boxRobots.obs.pipe(map((robotsMap) => (id ? robotsMap[id] : undefined)));
    },
    { primitive: true, max: 100 },
);
export const getRobots$ = (ids?: TRobotId[]): Observable<TRobot[] | undefined> => {
    return boxRobots.obs.pipe(
        map(
            (robotsMap) =>
                ids
                    ?.map((id) => robotsMap[id])
                    .filter((robot): robot is TRobot => robot !== undefined),
        ),
    );
};
export const getHerodotusRobots$ = (): Observable<TRobot[]> => {
    return boxRobots.obs.pipe(
        map((robotsMap) => Object.values(robotsMap)),
        map((robots) => robots.filter(isHerodotus)),
        map(sortByName),
    );
};
export const getRobot = (id?: TRobotId): TRobot | void => {
    return id ? boxRobots.get()[id] : undefined;
};
export const getRobots = (ids?: TRobotId[]): TRobot[] => {
    const map = boxRobots.get();
    return ids ? sortByName(ids.map((id) => map[id])) : [];
};

export const { obs: robotsRemovable$, set: enableRobotsRemoval } = createObservableBox(false);
