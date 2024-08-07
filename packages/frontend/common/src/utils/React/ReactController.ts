import type { Component, ErrorInfo } from 'react';

export type TMethodNames =
    | 'componentDidMount'
    | 'componentWillUnmount'
    | 'componentDidUpdate'
    | 'componentDidCatch';

const methods: TMethodNames[] = [
    'componentDidMount',
    'componentWillUnmount',
    'componentDidUpdate',
    'componentDidCatch',
];

export abstract class ReactController<Host extends Component, P, S, SS> {
    constructor(protected host: Host) {
        methods.forEach((methodName) => {
            this.wrapHostMethod(host, methodName);
        });
    }

    wrapHostMethod(host: Component, methodName: TMethodNames): void {
        const originalHostMethod = host[methodName];

        host[methodName] = (...args: unknown[]) => {
            // @ts-ignore
            this[methodName](...args);
            // @ts-ignore
            originalHostMethod && originalHostMethod.call(host, ...args);
        };
    }

    protected abstract componentDidMount?(): void;

    protected abstract componentWillUnmount?(): void;

    protected abstract componentDidUpdate?(
        prevProps: Readonly<P>,
        prevState: Readonly<S>,
        snapshot?: SS,
    ): void;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected abstract componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
}
