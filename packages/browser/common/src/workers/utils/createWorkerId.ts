import { getBuildId } from '../../utils/url';
import { TWorkerId } from '../defs';

export function createWorkerIds(name: string): TWorkerId {
    return `${name}_${getBuildId()}` as TWorkerId;
}
