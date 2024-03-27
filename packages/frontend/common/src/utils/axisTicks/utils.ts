import { Milliseconds } from '../../types/time';
import {
    dayInMilliseconds,
    hourInMilliseconds,
    minuteInMilliseconds,
    monthInMilliseconds,
    secondInMilliseconds,
    weekInMilliseconds,
} from '../time';

export const isLessThanSecond = (v: Milliseconds): boolean => v < secondInMilliseconds;
export const isLessThanMinute = (v: Milliseconds): boolean => v < minuteInMilliseconds;
export const isLessThanHour = (v: Milliseconds): boolean => v < hourInMilliseconds;
export const isLessThanDay = (v: Milliseconds): boolean => v < dayInMilliseconds;
export const isLessThanWeek = (v: Milliseconds): boolean => v < weekInMilliseconds;
export const isLessThanMonth = (v: Milliseconds): boolean => v < monthInMilliseconds;
