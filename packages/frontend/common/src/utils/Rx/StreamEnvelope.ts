// import { isEqual } from 'lodash-es';
// import {
//     map,
//     MonoTypeOperatorFunction,
//     Observable,
//     OperatorFunction,
//     scan,
//     share,
//     timer,
// } from 'rxjs';
// import { distinctUntilChanged, mergeMap, switchMap, tap } from 'rxjs/operators';
//
// import { Milliseconds } from '@common/types';
// import {
//     EStreamEnvelopeType,
//     ExtractFailStreamEnvelope,
//     ExtractValueStreamEnvelope,
//     TStreamEnvelope,
// } from '../../types/ValueDescriptor/StreamEnvelope';
// import { noop } from '../fn';
// import {
//     matchStreamEnvelope,
//     StreamEnvelopeHandlers,
//     TryConvertToStreamEnvelope,
// } from '../StreamEnvelope';
// import { LOADING_STATE } from '../ValueDescriptor2';
// import { dynamicMap, TDynamicMapResult, TSwitchMapResult } from '@common/rx';
// import { StreamEnvelopeReplaySubject } from './StreamEnvelopeReplaySubject';
//
// export function mapStreamEnvelope<
//     VD extends TStreamEnvelope<any>,
//     Out1 = ExtractValueStreamEnvelope<VD>,
//     Out2 = ExtractFailStreamEnvelope<VD>,
// >(
//     handlers: StreamEnvelopeHandlers<VD, Out1, Out2>,
// ): OperatorFunction<VD, TryConvertToStreamEnvelope<Out1, Out2>> {
//     return (source: Observable<VD>) => {
//         return source.pipe(map((d) => matchStreamEnvelope(d, handlers)));
//     };
// }
//
// export function dynamicMapStreamEnvelope<
//     VD extends TStreamEnvelope<any>,
//     Out1 = ExtractValueStreamEnvelope<VD>,
//     Out2 = ExtractFailStreamEnvelope<VD>,
// >(
//     handlers: StreamEnvelopeHandlers<
//         VD,
//         TSwitchMapResult<Observable<Out1>>,
//         TDynamicMapResult<Observable<Out2>>
//     >,
// ): OperatorFunction<VD, TryConvertToStreamEnvelope<Out1, Out2>> {
//     return (source: Observable<VD>) => {
//         return source.pipe(
//             dynamicMap(
//                 (d) =>
//                     matchStreamEnvelope(d, handlers) as TDynamicMapResult<
//                         Observable<TryConvertToStreamEnvelope<Out1, Out2>>
//                     >,
//             ),
//         );
//     };
// }
//
// export function switchMapStreamEnvelope<
//     VD extends TStreamEnvelope<any>,
//     Out1 = ExtractValueStreamEnvelope<VD>,
//     Out2 = ExtractFailStreamEnvelope<VD>,
// >(
//     handlers: StreamEnvelopeHandlers<VD, Observable<Out1>, Observable<Out2>>,
// ): OperatorFunction<VD, TryConvertToStreamEnvelope<Out1, Out2>> {
//     return (source: Observable<VD>) => {
//         return source.pipe(
//             switchMap(
//                 (d) =>
//                     matchStreamEnvelope(d, handlers) as Observable<
//                         TryConvertToStreamEnvelope<Out1, Out2>
//                     >,
//             ),
//         );
//     };
// }
//
// export function mergeMapStreamEnvelope<
//     VD extends TStreamEnvelope<any>,
//     Out1 = ExtractValueStreamEnvelope<VD>,
//     Out2 = ExtractFailStreamEnvelope<VD>,
// >(
//     handlers: StreamEnvelopeHandlers<VD, Observable<Out1>, Observable<Out2>>,
// ): OperatorFunction<VD, TryConvertToStreamEnvelope<Out1, Out2>> {
//     return (source: Observable<VD>) => {
//         return source.pipe(
//             mergeMap(
//                 (d) =>
//                     matchStreamEnvelope(d, handlers) as Observable<
//                         TryConvertToStreamEnvelope<Out1, Out2>
//                     >,
//             ),
//         );
//     };
// }
//
// export function distinctStreamEnvelopeUntilChanged<
//     VD extends TStreamEnvelope<any>,
// >(): MonoTypeOperatorFunction<VD> {
//     return distinctUntilChanged((a, b) => {
//         return a.type === b.type && isEqual(a.payload, b.payload);
//     });
// }
//
// export function tapStreamEnvelope<VD extends TStreamEnvelope<any>>({
//     value = noop,
//     fail = noop,
// }: Partial<StreamEnvelopeHandlers<VD, any, any>>): MonoTypeOperatorFunction<VD> {
//     return (source: Observable<VD>) => {
//         return source.pipe(tap((d) => matchStreamEnvelope(d, { value, fail })));
//     };
// }
//
// export function scanStreamEnvelope<Acc>(acc: Acc = LOADING_STATE as Acc) {
//     return <SE extends TStreamEnvelope<any>>(handlers: {
//         value: (acc: Acc, envelope: ExtractValueStreamEnvelope<SE>) => Acc;
//         fail: (acc: Acc, envelope: ExtractFailStreamEnvelope<SE>) => Acc;
//     }): OperatorFunction<SE, Acc> => {
//         return (source: Observable<SE>) => {
//             return source.pipe(
//                 scan((acc, envelope) => {
//                     switch (envelope.type) {
//                         case EStreamEnvelopeType.Value:
//                             return handlers.value(acc, envelope as ExtractValueStreamEnvelope<SE>);
//                         case EStreamEnvelopeType.Fail:
//                             return handlers.fail(acc, envelope as ExtractFailStreamEnvelope<SE>);
//                     }
//                 }, acc),
//             );
//         };
//     };
// }
//
// export const shareReplayStreamEnvelopeWithDelayedReset = <T extends TStreamEnvelope<any>>(
//     delay: Milliseconds,
// ) =>
//     share<T>({
//         connector: () => new StreamEnvelopeReplaySubject(),
//         resetOnError: true,
//         resetOnComplete: false,
//         resetOnRefCountZero: () => timer(delay),
//     });
//
// export const shareReplayStreamEnvelopeWithImmediateReset = <T extends TStreamEnvelope<any>>() =>
//     share<T>({
//         connector: () => new StreamEnvelopeReplaySubject(),
//         resetOnError: true,
//         resetOnComplete: false,
//         resetOnRefCountZero: true,
//     });
