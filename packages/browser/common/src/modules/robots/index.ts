import { ModuleFactory } from '../../di';
import {
    boxRobots,
    boxRobotsLoading,
    deleteRobots,
    enableRobotsRemoval,
    getHerodotusRobots$,
    getRobot,
    getRobot$,
    getRobots,
    getRobots$,
    robotsRemovable$,
    upsertRobots,
} from './data';

const module = {
    robots$: boxRobots.obs,
    getRobot$,
    getRobots$,
    getHerodotusRobots$,

    getRobot,
    getRobots,

    upsertRobots,
    deleteRobots,

    loading$: boxRobotsLoading.obs,
    setLoading: boxRobotsLoading.set,

    robotsRemovable$,
    enableRobotsRemoval,
};

export type IModuleRobots = typeof module;

export const ModuleRobots = ModuleFactory(() => module);
