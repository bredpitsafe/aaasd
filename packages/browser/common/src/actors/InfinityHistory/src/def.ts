import { Minutes } from '../../../types/time';
import { minutes2milliseconds } from '../../../utils/time';

export const BANK_INACTIVE_REMOVE_TIMEOUT = minutes2milliseconds(2 as Minutes);
