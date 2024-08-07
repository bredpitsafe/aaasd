import type { Opaque } from '@common/types';
import { getRandomInt32 } from '@common/utils';

export type TTabId = Opaque<'TabId', number>;
export const tabId = getRandomInt32() as TTabId;
