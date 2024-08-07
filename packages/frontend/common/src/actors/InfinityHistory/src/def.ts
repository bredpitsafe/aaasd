import type { Minutes } from '@common/types';
import { minutes2milliseconds } from '@common/utils';

export const BANK_INACTIVE_REMOVE_TIMEOUT = minutes2milliseconds(2 as Minutes);
