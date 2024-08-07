import type { TRobot } from '@frontend/common/src/types/domain/robots';
import { extractValidSemverVersion, getMinorVersion } from '@frontend/common/src/utils/Semver';
import { isNil, isNumber } from 'lodash-es';

import type { THerodotusTaskView } from '../types';
import { EHerodotusProtocolVersion } from '../types';
import type { THerodotusAccount, THerodotusTask, THerodotusTaskInstrument } from '../types/domain';
import type { THerodotusAccountV2 } from '../types/v2/account';
import type { THerodotusTaskInstrumentV2, THerodotusTaskV2 } from '../types/v2/task';

export const isV2HeroProtocolRobot = (robot: TRobot): boolean => {
    const semver = extractValidSemverVersion(robot.buildInfo?.version);
    return isNil(semver) || getMinorVersion(semver) > 0;
};

export const isV2HeroProtocolTask = (task: THerodotusTask): task is THerodotusTaskV2 => {
    return isNil(task.amount) || isNumber(task.amount);
};

export const isV2HeroProtocolInstrument = (
    inst: THerodotusTaskInstrument,
): inst is THerodotusTaskInstrumentV2 => {
    return 'instrumentId' in inst;
};

export const isV2HeroProtocolTaskView = (task: THerodotusTaskView): boolean => {
    return task.protocol === EHerodotusProtocolVersion.V2;
};

export const isV2HeroProtocolAccount = (acc: THerodotusAccount): acc is THerodotusAccountV2 => {
    return 'virtualAccountId' in acc;
};
