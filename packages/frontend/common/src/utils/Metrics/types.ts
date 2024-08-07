export interface ITimeWindowQuantiles {
    percentile(n: number): number;
    compress(): void;
}
