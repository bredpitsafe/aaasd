import { TContextRef } from '../../di';
import { Mistake } from '../../utils/Mistake';
import { logger } from '../../utils/Tracing';
import { ModuleMessages } from '../messages';
import { ModuleNotifications } from '../notifications/module';

export function showError<E extends Error>(ctx: TContextRef, err: unknown | E): void {
    if (err instanceof Error) {
        const { open: openMessage } = ModuleMessages(ctx);
        const { open: openNotification } = ModuleNotifications(ctx);

        if (err instanceof Mistake) {
            const mistake = err as Mistake;

            if (typeof mistake.toNotification === 'function') {
                openNotification(mistake.toNotification());
            } else if (typeof mistake.toMessage === 'function') {
                openMessage(mistake.toMessage());
            } else {
                openMessage({ type: 'error', content: mistake.toString() });
            }
        } else {
            openNotification({ message: err.message });
        }
    } else {
        logger.error('Error with incorrect format', err);
    }
}
