import { BehaviorSubject, of } from 'rxjs';

import type { TValueDescriptor2 } from '../ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
} from '../ValueDescriptor/utils.ts';
import { takeWhileFirstSyncValueDescriptor } from './ValueDescriptor2.ts';

describe('ValueDescriptor2', () => {
    describe('takeWhileFirstSyncValueDescriptor', () => {
        it('stops execution of a normal observable', () => {
            const observable = of(
                createUnsyncedValueDescriptor(null),
                createSyncedValueDescriptor('test'),
                createUnsyncedValueDescriptor(null),
            );

            const cb = jest.fn();
            observable.pipe(takeWhileFirstSyncValueDescriptor()).subscribe(cb);
            expect(cb).toBeCalledTimes(2);
        });

        it('stops execution of a looped observable', async () => {
            const subject = new BehaviorSubject<TValueDescriptor2<any>>(
                createUnsyncedValueDescriptor(null),
            );

            const cb = jest.fn();
            const subscription = subject
                .pipe(takeWhileFirstSyncValueDescriptor())
                .subscribe((v) => {
                    cb(v);
                    subject.next(createSyncedValueDescriptor('test'));
                });
            // Initial call from BehaviorSubject + sync next emit from `tap`.
            expect(cb).toBeCalledTimes(2);

            subscription.unsubscribe();
        });
    });
});
