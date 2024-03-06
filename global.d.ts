// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface IConstructor<T = any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): T;
}
