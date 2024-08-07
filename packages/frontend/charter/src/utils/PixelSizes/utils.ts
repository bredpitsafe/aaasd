import type { Someseconds } from '@common/types';
import { mul } from '@common/utils';

export const getBiggerPixelSize = (v: Someseconds, pixelSizes: Someseconds[]): Someseconds => {
    const index = pixelSizes.indexOf(v);
    const last = pixelSizes[pixelSizes.length - 1];

    return index >= 0 && index < pixelSizes.length - 1
        ? pixelSizes[index + 1]
        : mul(last, v / last + 1);
};
export function getSuitablePixelSize(
    realPixelSizes: Someseconds,
    pixelSizes: Someseconds[],
): Someseconds {
    return getPixelSizeToLowSide(realPixelSizes, pixelSizes);
    // return getPixelSizeToClosestSide(realPixelSizes, pixelSizes);
    // return getPixelSizeToHighSide(realPixelSizes, pixelSizes);
}

/*function getPixelSizeToClosestSide(
    realPixelSizes: Someseconds,
    pixelSizes: Someseconds[],
) {
    // Get closest gridPixelSize
    let diff = Infinity;
    let gridPixelSize = pixelSizes[0];

    while (true) {
        const newDiff = Math.abs(gridPixelSize - realPixelSizes);

        if (newDiff < diff) {
            diff = newDiff;
        } else {
            break;
        }

        gridPixelSize = getBiggerPixelSize(gridPixelSize, pixelSizes);
    }

    return <Someseconds>gridPixelSize;
}*/

function getPixelSizeToLowSide(
    realPixelSizes: Someseconds,
    pixelSizes: Someseconds[],
): Someseconds {
    let gridPixelSize = pixelSizes[0];
    let prevGridPixelSize = gridPixelSize;

    while (true) {
        if (gridPixelSize > realPixelSizes) {
            break;
        }

        prevGridPixelSize = gridPixelSize;
        gridPixelSize = getBiggerPixelSize(gridPixelSize, pixelSizes);
    }

    return prevGridPixelSize;
}

/*function getPixelSizeToHighSide(
    realPixelSizes: Someseconds,
    pixelSizes: Someseconds[],
): Someseconds {
    let gridPixelSize = pixelSizes[0];
    let prevGridPixelSize = gridPixelSize;

    while (true) {
        if (gridPixelSize > realPixelSizes) {
            break;
        }

        prevGridPixelSize = gridPixelSize;
        gridPixelSize = getBiggerPixelSize(gridPixelSize, pixelSizes);
    }

    return gridPixelSize;
}*/

/*function getPixelSizeToBestSide(
    realPixelSizes: Someseconds,
    pixelSizes: Someseconds[],
) {
    // Get closest gridPixelSize
    let diff = Infinity;
    let gridPixelSize = pixelSizes[0];

    while (true) {
        const newDiff = Math.abs(gridPixelSize - realPixelSizes);

        if (newDiff < diff) {
            diff = newDiff;
        } else {
            break;
        }

        gridPixelSize = getBiggerPixelSize(gridPixelSize, pixelSizes);
    }

    return <Someseconds>gridPixelSize;
}*/
