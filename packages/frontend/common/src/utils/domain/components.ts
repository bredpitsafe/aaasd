import { EComponentStatus } from '../../types';
import type { TComponent } from '../../types/domain/component';
import type { TGate } from '../../types/domain/gates';
import type { TRobot } from '../../types/domain/robots';

export function componentIsAllowed(status: EComponentStatus): boolean {
    switch (status) {
        case EComponentStatus.Enabled:
        case EComponentStatus.Alarming:
            return true;
        default:
            return false;
    }
}

export function isRobot(component: TComponent): component is TRobot {
    return isGate(component) === false;
}

export function isGate(component: TComponent): component is TGate {
    return (component as TGate).type !== undefined;
}
