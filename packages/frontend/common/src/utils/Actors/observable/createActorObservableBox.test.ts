import { cloneDeep } from 'lodash-es';
import { firstValueFrom, from, interval, lastValueFrom, Observable, of } from 'rxjs';
import { finalize, map, take, tap } from 'rxjs/operators';

import type { TActorObservableBox } from './def.ts';
import { createActorObservableBox } from './index.ts';

const BOX_TYPE = 'TEST_BOX';

const actor = {};
type Request = { data: any };
type Response = { data: any };

describe('createActorObservableBox', () => {
    let box: TActorObservableBox<'TEST_BOX', Request, Response>;
    const request: Request = { data: {} };
    const response: Response = { data: {} };

    describe('subscriptions behavior', () => {
        beforeEach(() => {
            box = createActorObservableBox<Request, Response>()(BOX_TYPE);
        });

        afterEach(() => {
            box.destroy();
        });

        it('response stream should receive data from request stream', (done) => {
            box.responseStream(actor, (req) => {
                expect(req).toBe(request);
                done();
                return of(response);
            });

            box.requestStream(actor, request).subscribe();
        });

        it('response stream should return value to request stream', (done) => {
            box.responseStream(actor, () => {
                return of(response);
            });

            box.requestStream(actor, request).subscribe((value) => {
                expect(value).toBe(response);
                done();
            });
        });

        it('response stream should handle multiple requests', async () => {
            const cb = jest.fn();
            box.responseStream(actor, (req) => {
                cb(req);
                return of(response);
            });

            await firstValueFrom(box.requestStream(actor, request));
            await firstValueFrom(box.requestStream(actor, request));
            expect(cb).toHaveBeenCalledTimes(2);
        });

        it('response stream should handle multiple responses', async () => {
            const responses = [response, response, response];
            box.responseStream(actor, () => {
                return from(responses);
            });

            const cb = jest.fn();
            await lastValueFrom(box.requestStream(actor, request).pipe(tap(cb)));
            expect(cb).toHaveBeenCalledTimes(responses.length);
            responses.forEach((response, i) => {
                expect(response).toBe(cb.mock.calls[i][0]);
            });
        });

        it('errors requestStream when responseStream observable ends with error', async () => {
            const err = new Error('test error');
            box.responseStream(actor, () => {
                return new Observable((subscriber) => {
                    subscriber.next(response);
                    subscriber.error(err);
                });
            });

            await expect(lastValueFrom(box.requestStream(actor, request))).rejects.toBe(err);
        });

        it('errors requestStream when responseStream is not registered', async () => {
            await expect(
                lastValueFrom(box.requestStream(actor, request)),
            ).rejects.toMatchSnapshot();
        });

        it('errors when trying to reevaluate responseStream', () => {
            box.responseStream(actor, () => of(response));
            expect(() =>
                box.responseStream(actor, () => of(response)),
            ).toThrowErrorMatchingSnapshot();
            box.destroy();
        });

        it('deregisters responseStream', async () => {
            const deregisterResponseStream = box.responseStream(actor, () => of(response));
            deregisterResponseStream();
            await expect(
                firstValueFrom(box.requestStream(actor, request)),
            ).rejects.toMatchSnapshot();
            expect(() => box.responseStream(actor, () => of(response))).not.toThrow();
            await expect(firstValueFrom(box.requestStream(actor, request))).resolves.toBe(response);
        });

        it('handles multiple requestStreams with a single responseStream', async () => {
            const responses: Response[] = [
                cloneDeep(response),
                cloneDeep(response),
                cloneDeep(response),
            ];
            let responseIndex = 0;
            box.responseStream(actor, () => {
                return of(responses[responseIndex++]);
            });

            for (const res of responses) {
                const streamRes = await lastValueFrom(box.requestStream(actor, request));
                expect(streamRes).toBe(res);
            }
        });

        it('completes responseStream when requestStream is completed', async () => {
            const cbComplete = jest.fn();
            const obs$ = interval(1).pipe(
                map(() => response),
                finalize(cbComplete),
            );
            box.responseStream(actor, () => obs$);

            await lastValueFrom(box.requestStream(actor, request).pipe(take(10)));

            expect(cbComplete).toHaveBeenCalled();
        });

        it('completes responseStream when requestStream ends with error', async () => {
            const err = new Error('test error');
            const cbComplete = jest.fn();
            const obs$ = interval(1).pipe(
                map(() => response),
                finalize(cbComplete),
            );
            box.responseStream(actor, () => obs$);

            await expect(
                lastValueFrom(
                    box.requestStream(actor, request).pipe(
                        map((res, i) => {
                            if (i === 10) {
                                throw err;
                            }
                            return res;
                        }),
                    ),
                ),
            ).rejects.toBe(err);

            expect(cbComplete).toHaveBeenCalled();
        });

        it('completes only required response observable when requestStream completes', async () => {
            const cbComplete1 = jest.fn();
            const obs$1 = interval(1).pipe(
                map(() => response),
                finalize(cbComplete1),
            );
            const cbComplete2 = jest.fn();
            const obs$2 = interval(1).pipe(
                map(() => response),
                finalize(cbComplete2),
            );
            let requestIndex = 0;
            box.responseStream(actor, () => {
                if (requestIndex++ === 0) {
                    return obs$1;
                }
                return obs$2;
            });

            box.requestStream(actor, request).subscribe();
            await lastValueFrom(box.requestStream(actor, request).pipe(take(10)));

            expect(cbComplete1).not.toHaveBeenCalled();
            expect(cbComplete2).toHaveBeenCalled();
        });

        it('errors only a single requestStream when multiple streams are active', async () => {
            const err = new Error('test error');

            let responseIndex = 0;
            box.responseStream(actor, () => {
                return new Observable((subscriber) => {
                    subscriber.next(response);

                    if (responseIndex === 0) {
                        subscriber.error(err);
                    }
                    responseIndex++;
                });
            });

            await expect(lastValueFrom(box.requestStream(actor, request))).rejects.toBe(err);

            const cbNext = jest.fn();
            const cbComplete = jest.fn();
            const subscription = box
                .requestStream(actor, request)
                .pipe(tap(cbNext), finalize(cbComplete))
                .subscribe();

            expect(cbNext).toHaveBeenLastCalledWith(response);
            expect(cbComplete).not.toHaveBeenCalled();
            subscription.unsubscribe();
        });

        it('completes only a single requestStream when multiple streams are active', async () => {
            let responseIndex = 0;
            box.responseStream(actor, () => {
                return new Observable((subscriber) => {
                    subscriber.next(response);

                    if (responseIndex === 0) {
                        subscriber.complete();
                    }
                    responseIndex++;
                });
            });
            expect(await lastValueFrom(box.requestStream(actor, request))).toBe(response);

            const cbNext = jest.fn();
            const cbComplete = jest.fn();
            const subscription = box
                .requestStream(actor, request)
                .pipe(tap(cbNext), finalize(cbComplete))
                .subscribe();

            expect(cbNext).toHaveBeenLastCalledWith(response);
            expect(cbComplete).not.toHaveBeenCalled();
            subscription.unsubscribe();
        });

        it('requestStream subscriptions work after emitting an error before', async () => {
            const err = new Error('test error');

            let responseIndex = 0;
            box.responseStream(actor, () => {
                return new Observable((subscriber) => {
                    if (responseIndex === 0) {
                        subscriber.error(err);
                        responseIndex++;
                        return;
                    }
                    subscriber.next(response);
                });
            });

            await expect(firstValueFrom(box.requestStream(actor, request))).rejects.toBe(err);
            await expect(firstValueFrom(box.requestStream(actor, request))).resolves.toBe(response);
        });
    });

    describe('box deduplication behavior', () => {
        beforeEach(() => {
            box = createActorObservableBox<Request, Response>()(BOX_TYPE);
        });

        it('creating a box multiple times should yield the same box', () => {
            const box2 = createActorObservableBox<Request, Response>()(BOX_TYPE);
            expect(box2).toBe(box);
            box.destroy();
        });

        it('trying to subscribe to a deduplicated box yields subscription results', async () => {
            box.responseStream(actor, () => of(response));
            const box2 = createActorObservableBox<Request, Response>()(BOX_TYPE);
            expect(await lastValueFrom(box2.requestStream(actor, request))).toBe(response);
            box.destroy();
        });

        it('should destroy a box', () => {
            box.destroy();
            const box2 = createActorObservableBox<Request, Response>()(BOX_TYPE);
            expect(box2).not.toBe(box);
        });

        it('should destroy all deduplicated boxes', () => {
            const box2 = createActorObservableBox<Request, Response>()(BOX_TYPE);
            box.destroy();

            const box3 = createActorObservableBox<Request, Response>()(BOX_TYPE);
            expect(box3).not.toBe(box2);
        });

        it('should finalize all box subscriptions upon box destruction', async () => {
            const cbFinalize = jest.fn();
            box.responseStream(actor, () =>
                new Observable<Response>((subscriber) => subscriber.next(response)).pipe(
                    finalize(cbFinalize),
                ),
            );

            const promise = lastValueFrom(box.requestStream(actor, request));
            box.destroy();
            expect(await promise).toBe(response);
            expect(cbFinalize).toHaveBeenCalled();
        });
    });
});
