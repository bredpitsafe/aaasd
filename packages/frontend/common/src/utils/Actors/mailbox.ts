import EventEmitter from 'eventemitter3';
import { AnyEnvelope, Mailbox } from 'webactor';

export function createMailbox<T extends AnyEnvelope>(): Mailbox<T> {
    const ee = new EventEmitter();

    return {
        dispatch: (envelope) => {
            ee.emit('message', envelope);
        },
        subscribe: (callback) => {
            ee.on('message', callback);
            return () => ee.off('message', callback);
        },
    };
}
