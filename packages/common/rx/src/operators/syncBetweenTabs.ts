import { BroadcastChannel } from 'broadcast-channel';
import type { MonoTypeOperatorFunction } from 'rxjs';
import { fromEvent, Observable } from 'rxjs';
import { OperatorSubscriber } from 'rxjs/internal/operators/OperatorSubscriber';
import { operate } from 'rxjs/internal/util/lift';
import { finalize } from 'rxjs/operators';

type TChannelKey = string;

const mapKeyToChannel = new Map<TChannelKey, BroadcastChannel>();
const mapKeyToConsumersCount = new Map<TChannelKey, number>();

export function borrowChannel(key: string): BroadcastChannel {
    if (!mapKeyToChannel.has(key)) {
        mapKeyToChannel.set(key, new BroadcastChannel(key));
        mapKeyToConsumersCount.set(key, 0);
    }

    mapKeyToConsumersCount.set(key, mapKeyToConsumersCount.get(key)! + 1);

    return mapKeyToChannel.get(key)!;
}

export function releaseChannel(key: string): void {
    const channel = mapKeyToChannel.get(key)!;
    const count = mapKeyToConsumersCount.get(key)!;

    // last consumer
    if (count === 1) {
        channel.close();
        mapKeyToChannel.delete(key);
        mapKeyToConsumersCount.delete(key);
    }

    mapKeyToConsumersCount.set(key, count - 1);
}

export function sendToTabs<T>(key: string): MonoTypeOperatorFunction<T> {
    return operate((source, subscriber) => {
        const channel = borrowChannel(key);

        source.pipe(finalize(() => releaseChannel(key))).subscribe(
            new OperatorSubscriber<T>(subscriber, (value) => {
                subscriber.next(value);
                channel.postMessage(value);
            }),
        );
    });
}

export function receiveFromTabs<T>(key: string): Observable<T> {
    return new Observable<T>((subscriber) => {
        const channel = borrowChannel(key);
        const channelSubscription = fromEvent(channel, 'message').subscribe(subscriber);

        return () => {
            releaseChannel(key);
            channelSubscription.unsubscribe();
        };
    });
}
