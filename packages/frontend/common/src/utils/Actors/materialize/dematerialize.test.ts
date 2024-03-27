import { from, ObservableNotification } from 'rxjs';

import { EErrorReason } from '../../../lib/SocketStream/def';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { TSocketURL } from '../../../types/domain/sockets.ts';
import { EGrpcErrorCode } from '../../../types/GrpcError';
import { Defer } from '../../Defer';
import { generateTraceId } from '../../traceId';
import { dematerialize } from './dematerialize';

describe('dematerialize', () => {
    it('should dematerialize an empty stream', async () => {
        const happyStream = from([
            {
                kind: 'C',
            },
        ] as ObservableNotification<string>[]).pipe(dematerialize([SocketStreamError]));

        const testAwaiter = new Defer<void>();

        const result: any[] = [];
        let thrownError: any = undefined;

        happyStream.subscribe({
            next(value) {
                result.push(value);
            },
            error(error) {
                thrownError = error;
                testAwaiter.resolve();
            },
            complete() {
                testAwaiter.resolve();
            },
        });

        await testAwaiter.promise;

        expect(result.length).toEqual(0);
        expect(thrownError).toBeUndefined();
    });

    it('should dematerialize a happy stream', async () => {
        const happyStream = from([
            {
                kind: 'N',
                value: 'a',
            },
            {
                kind: 'N',
                value: 'b',
            },
            {
                kind: 'N',
                value: 'c',
            },
            {
                kind: 'N',
                value: 'd',
            },
            {
                kind: 'C',
            },
        ] as ObservableNotification<string>[]).pipe(dematerialize([SocketStreamError]));

        const testAwaiter = new Defer<void>();

        const result: any[] = [];
        let thrownError: any = undefined;

        happyStream.subscribe({
            next(value) {
                result.push(value);
            },
            error(error) {
                thrownError = error;
                testAwaiter.resolve();
            },
            complete() {
                testAwaiter.resolve();
            },
        });

        await testAwaiter.promise;

        expect(result).toEqual(['a', 'b', 'c', 'd']);
        expect(thrownError).toBeUndefined();
    });

    it('should dematerialize a sad stream with simple Error', async () => {
        const sadStream = from([
            {
                kind: 'N',
                value: 'a',
            },
            {
                kind: 'N',
                value: 'b',
            },
            {
                kind: 'E',
                error: new Error('Error message'),
            },
        ] as ObservableNotification<string>[]).pipe(dematerialize([SocketStreamError]));

        const testAwaiter = new Defer<void>();

        const result: any[] = [];
        let thrownError: any = undefined;

        sadStream.subscribe({
            next(value) {
                result.push(value);
            },
            error(error) {
                thrownError = error;
                testAwaiter.resolve();
            },
            complete() {
                testAwaiter.resolve();
            },
        });

        await testAwaiter.promise;

        expect(result).toMatchObject(['a', 'b']);

        expect(thrownError).toBeInstanceOf(Error);
    });

    it('should dematerialize a sad stream with SocketStreamError', async () => {
        const options = {
            code: EGrpcErrorCode.UNKNOWN,
            traceId: generateTraceId(),
            reason: EErrorReason.socketClose,
            correlationId: 777,
            socketURL: 'wss://test' as TSocketURL,
        };

        const sadStream = from([
            {
                kind: 'N',
                value: 'a',
            },
            {
                kind: 'N',
                value: 'b',
            },
            {
                kind: 'E',
                error: new SocketStreamError(
                    'SocketStreamError message',
                    options,
                ).toStructurallyCloneable(),
            },
        ] as ObservableNotification<string>[]).pipe(dematerialize([SocketStreamError]));

        const testAwaiter = new Defer<void>();

        const result: string[] = [];
        let thrownError: any = undefined;

        sadStream.subscribe({
            next(value) {
                result.push(value);
            },
            error(error) {
                thrownError = error;
                testAwaiter.resolve();
            },
            complete() {
                testAwaiter.resolve();
            },
        });

        await testAwaiter.promise;

        expect(result).toMatchObject(['a', 'b']);

        expect(thrownError).toBeInstanceOf(SocketStreamError);
        expect(thrownError).toMatchObject({
            message: 'SocketStreamError message',
            ...options,
        });
    });

    it('should dematerialize a sad stream with unknown error type', async () => {
        const sadStream = from([
            {
                kind: 'N',
                value: 'a',
            },
            {
                kind: 'N',
                value: 'b',
            },
            {
                kind: 'E',
                error: { someField: 'foo bar' },
            },
        ] as ObservableNotification<string>[]).pipe(dematerialize([SocketStreamError]));

        const testAwaiter = new Defer<void>();

        const result: any[] = [];
        let thrownError: any = undefined;

        sadStream.subscribe({
            next(value) {
                result.push(value);
            },
            error(error) {
                thrownError = error;
                testAwaiter.resolve();
            },
            complete() {
                testAwaiter.resolve();
            },
        });

        await testAwaiter.promise;

        expect(result).toMatchObject(['a', 'b']);
        expect(thrownError).toMatchObject({ someField: 'foo bar' });
    });
});
