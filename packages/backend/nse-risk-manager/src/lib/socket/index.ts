import type { TFetchHandler } from '@frontend/common/src/modules/communicationHandlers/def';
import { assert } from '@frontend/common/src/utils/assert';
import { isNil } from 'lodash-es';

import { createHandler } from './createHandler';

/**
 * @public
 */
export const streamHandler = createHandler();
export const fetchHandler: TFetchHandler = (url, body, options) => {
    assert(!isNil(url), 'Socket URL must be specified to make a request');
    return streamHandler(url, () => [body], options);
};
