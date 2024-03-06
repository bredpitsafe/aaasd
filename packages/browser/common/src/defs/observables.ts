import { Minutes } from '../types/time';
import { minutes2milliseconds } from '../utils/time';

export const DEDUPE_REMOVE_DELAY = minutes2milliseconds(5 as Minutes);
export const SHARE_RESET_DELAY = minutes2milliseconds(5 as Minutes);
