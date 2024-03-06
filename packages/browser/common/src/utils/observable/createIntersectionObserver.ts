import { Observable } from 'rxjs';

export function createIntersectionObserver$(
    target: Element,
    options?: IntersectionObserverInit,
): Observable<IntersectionObserverEntry> {
    return new Observable<IntersectionObserverEntry>((subscriber) => {
        const intersectionObserver = new IntersectionObserver(
            (entries: IntersectionObserverEntry[]) => {
                for (let index = entries.length - 1; index >= 0; index--) {
                    const entry = entries[index];
                    if (entry.target === target && entry.rootBounds) {
                        subscriber.next(entry);
                        break;
                    }
                }
            },
            options,
        );

        subscriber.add(() => {
            intersectionObserver.unobserve(target);
            intersectionObserver.disconnect();
        });

        intersectionObserver.observe(target);
    });
}
