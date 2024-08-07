import type { Minutes, Seconds } from '@common/types';
import { minutes2milliseconds, seconds2milliseconds } from '@common/utils';

export const DEDUPE_REMOVE_DELAY = minutes2milliseconds(1 as Minutes);
export const SHARE_RESET_DELAY = seconds2milliseconds(30 as Seconds);
