import { isPrimitive } from './isPrimitive.ts';

export function isFlatObject(obj: Object): boolean {
    return Object.values(obj).every(isPrimitive);
}
