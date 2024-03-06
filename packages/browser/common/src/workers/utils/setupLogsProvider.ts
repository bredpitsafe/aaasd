import { of } from 'rxjs';
import { Actor } from 'webactor';

import { pullLogsEnvBox } from '../../actors/actions';
import { getLogs } from '../../utils/Tracing';

export function setupLogsProvider(root: Actor) {
    pullLogsEnvBox.response(root, () => of(getLogs()));
}
