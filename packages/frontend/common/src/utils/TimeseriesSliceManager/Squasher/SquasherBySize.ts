import type { TimeseriesSliceManager } from '../index';

export class TimeseriesSliceSquasherBySize {
    constructor(
        private host: TimeseriesSliceManager<any>,
        private size: number,
    ) {}

    public squash() {
        const { size, host } = this;
        const slices = host.getAllSlices();
        let forSquash = [];
        let sum = 0;

        for (const slice of slices) {
            if (slice.items !== undefined && slice.items.length < size) {
                forSquash.push(slice);
            }
            if (slice.items === undefined || sum >= size) {
                forSquash.length > 1 && host.squashSlices(forSquash);
                forSquash = [];
                sum = 0;
            }
        }
    }
}
