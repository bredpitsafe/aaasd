export class Defer<T = unknown> {
    promise!: Promise<T>;
    resolve!: (v: T) => void;
    reject!: (v?: Error) => void;

    resolved = false;
    rejected = false;

    constructor() {
        this.restart();
    }

    restart(): void {
        this.promise = new Promise((res, rej) => {
            this.resolve = (v) => {
                if (this.rejected === false) {
                    this.resolved = true;
                    res(v);
                }
            };
            this.reject = (v) => {
                if (this.resolved === false) {
                    this.rejected = true;
                    rej(v);
                }
            };
        });
    }
}
