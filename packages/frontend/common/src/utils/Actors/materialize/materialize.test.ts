import { isString } from 'lodash-es';
import { from, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { EErrorReason } from '../../../lib/SocketStream/def';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { TSocketURL } from '../../../types/domain/sockets.ts';
import { EGrpcErrorCode } from '../../../types/GrpcError';
import { Defer } from '../../Defer';
import type { TraceId } from '../../traceId';
import { materialize } from './materialize';

describe('materialize', () => {
    it('should materialize an empty stream', async () => {
        const happyStream = from([]).pipe(materialize());

        const testAwaiter = new Defer<void>();

        const result: any[] = [];

        happyStream.subscribe({
            next(value) {
                result.push(value);
            },
            error(error) {
                result.push(error);
            },
            complete() {
                testAwaiter.resolve();
            },
        });

        await testAwaiter.promise;

        expect(result).toEqual([
            {
                kind: 'C',
            },
        ]);
    });

    it('should materialize a happy stream', async () => {
        const happyStream = from(['a', 'b', 'c', 'd']).pipe(materialize());

        const testAwaiter = new Defer<void>();

        const result: any[] = [];

        happyStream.subscribe({
            next(value) {
                result.push(value);
            },
            error(error) {
                result.push(error);
            },
            complete() {
                testAwaiter.resolve();
            },
        });

        await testAwaiter.promise;

        expect(result).toEqual([
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
        ]);
    });

    it('should materialize a sad stream with simple Error', async () => {
        const sadStream = from(['a', 'b', new Error('Error message')]).pipe(
            switchMap((x) => (isString(x) ? of(x) : throwError(() => x))),
            materialize(),
        );

        const testAwaiter = new Defer<void>();

        const result: any[] = [];

        sadStream.subscribe({
            next(value) {
                result.push(value);
            },
            error(error) {
                result.push(error);
                testAwaiter.resolve();
            },
            complete() {
                testAwaiter.resolve();
            },
        });

        await testAwaiter.promise;

        expect(result).toMatchObject([
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
                error: expect.any(Error),
            },
        ]);
    });

    it('should materialize a sad stream with SocketStreamError', async () => {
        const err = new SocketStreamError('SocketStreamError message', {
            code: EGrpcErrorCode.UNKNOWN,
            reason: EErrorReason.socketClose,
            traceId: 'TraceID_007' as TraceId,
            correlationId: 777,
            socketURL: 'wss://test' as TSocketURL,
        });
        const sadStream = from(['a', 'b', err]).pipe(
            switchMap((x) => (isString(x) ? of(x) : throwError(() => x))),
            materialize(),
        );

        const testAwaiter = new Defer<void>();

        const result: any[] = [];

        sadStream.subscribe({
            next(value) {
                result.push(value);
            },
            error(error) {
                result.push(error);
                testAwaiter.resolve();
            },
            complete() {
                testAwaiter.resolve();
            },
        });

        await testAwaiter.promise;

        expect(result).toMatchObject([
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
                error: err.toStructurallyCloneable(),
            },
        ]);
    });

    it('should materialize a sad stream with unknown error type', async () => {
        const sadStream = from(['a', 'b', new Error()]).pipe(
            switchMap((x) => (isString(x) ? of(x) : throwError(() => ({ someField: 'foo bar' })))),
            materialize(),
        );

        const testAwaiter = new Defer<void>();

        const result: any[] = [];

        sadStream.subscribe({
            next(value) {
                result.push(value);
            },
            error(error) {
                result.push(error);
                testAwaiter.resolve();
            },
            complete() {
                testAwaiter.resolve();
            },
        });

        await testAwaiter.promise;

        expect(result).toMatchObject([
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
        ]);
    });
});
