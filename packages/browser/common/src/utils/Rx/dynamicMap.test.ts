import { delay, mergeMap, of, toArray } from 'rxjs';

import { dynamicMap, toMerge, toSwitch } from './dynamicMap';

describe('dynamicMap', () => {
    it('full sync case with toMerge', (done) => {
        of(1, 2, 3)
            .pipe(
                dynamicMap((value) => {
                    return toMerge(of(value));
                }),
                toArray(),
            )
            .subscribe((result) => {
                expect(result).toEqual([1, 2, 3]);
                done();
            });
    });

    it('sync source and async toMerge', (done) => {
        of(1, 2, 3)
            .pipe(
                dynamicMap((value) => {
                    return toMerge(of(value).pipe(delay(100)));
                }),
                toArray(),
            )
            .subscribe((result) => {
                expect(result).toEqual([1, 2, 3]);
                done();
            });
    });

    it('sync source and async toSwitch', (done) => {
        of(1, 2, 3)
            .pipe(
                dynamicMap((value) => {
                    return toSwitch(of(value).pipe(delay(100)));
                }),
            )
            .subscribe((result) => {
                expect(result).toEqual(3);
                done();
            });
    });

    it('sync source and async toMerge + toSwitch', (done) => {
        of(1, 2, 3, 4)
            .pipe(
                dynamicMap((value) => {
                    if (value === 3) {
                        return toSwitch(of(value));
                    }
                    return toMerge(of(value).pipe(delay(100)));
                }),
                toArray(),
            )
            .subscribe((result) => {
                expect(result).toEqual([3, 4]);
                done();
            });
    });

    it('async source and async toMerge + toSwitch', (done) => {
        of(1, 2, 3, 4)
            .pipe(
                mergeMap((value) => of(value).pipe(delay(value * 10))),
                dynamicMap((value) => {
                    if (value === 2) {
                        return toSwitch(of(value));
                    }
                    return toMerge(of(value).pipe(delay(100)));
                }),
                toArray(),
            )
            .subscribe((result) => {
                expect(result).toEqual([2, 3, 4]);
                done();
            });
    });
});
