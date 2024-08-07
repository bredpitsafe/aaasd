import type { Minutes, Seconds } from '@common/types';
import { minutes2hours, seconds2minutes } from '@common/utils';
import type { RowClassParams, RowClassRules } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';

import type { TPumpDumpInfo } from '../../../modules/actions/ModuleSubscribeToCurrentPumpDumpInfo.ts';
import { cnRowStyles } from './view.css';

export const ROW_CLASS_RULES: RowClassRules<TPumpDumpInfo> = {
    [cnRowStyles.positive]: ({ node: { data } }: RowClassParams<TPumpDumpInfo>) =>
        !isNil(data) && data.endRate.rate - data.startRate.rate > 0,
    [cnRowStyles.negative]: ({ node: { data } }: RowClassParams<TPumpDumpInfo>) =>
        !isNil(data) && data.endRate.rate - data.startRate.rate < 0,
};

export function interval2text(totalSeconds: Seconds) {
    if (totalSeconds === 0) {
        return '0s';
    }

    const total = [];

    const seconds = totalSeconds % 60;
    const totalMinutes = seconds2minutes((totalSeconds - seconds) as Seconds);
    const minutes = totalMinutes % 60;
    const hours = minutes2hours((totalMinutes - minutes) as Minutes);

    if (hours > 0) {
        total.push(`${hours}h`);
    }
    if (minutes > 0) {
        total.push(`${minutes}m`);
    }
    if (seconds > 0) {
        total.push(`${seconds}s`);
    }

    return total.join(' ');
}

export function directionNumber2Display(direction: number): 'Up' | 'Down' | null {
    if (direction > 0) {
        return 'Up';
    }

    if (direction < 0) {
        return 'Down';
    }

    return null;
}
