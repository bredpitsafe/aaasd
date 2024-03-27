import { TServer } from '@frontend/common/src/types/domain/servers';
import { assert } from '@frontend/common/src/utils/assert';
import { isUndefined } from 'lodash-es';

export function isServerDefined(currentServer: TServer | undefined): TServer {
    assert(!isUndefined(currentServer), 'nodeId must be defined!');

    return currentServer;
}
