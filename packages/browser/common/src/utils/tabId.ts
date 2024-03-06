import { Opaque } from '../types';
import { getRandomInt32 } from './random';

export type TTabId = Opaque<'TabId', number>;
export const tabId = getRandomInt32() as TTabId;
