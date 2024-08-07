export const withTimeout = <T>(promise: Promise<T>, timeout = 5000): Promise<T> =>
    Promise.race<T>([
        promise,
        new Promise((_, reject) =>
            setTimeout(
                () => reject(new Error(`Timeout error. Promise couldn't resolve on time`)),
                timeout,
            ),
        ),
    ]);
