import { EComponentType } from '../types/domain/component';

export function getComponentPrefix(type: EComponentType): string {
    switch (type) {
        case EComponentType.mdGate:
        case EComponentType.execGate:
            return 'gate';
        case EComponentType.robot:
            return 'robot';
        default:
            return 'unknown';
    }
}
