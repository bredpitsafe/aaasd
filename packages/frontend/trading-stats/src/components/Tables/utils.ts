import { assert } from '@common/utils/src/assert.ts';
import { blue } from '@frontend/common/src/utils/colors.ts';
import Rainbow from '@indot/rainbowvis';

const DEFAULT_GRADIENT = ['#ffffff', blue[3]];
const rainbow = new Rainbow();
rainbow.setNumberRange(0, 1);
rainbow.setSpectrum(...DEFAULT_GRADIENT);

export function getHeatMapColor(value: number, min: number, max: number) {
    assert(max >= min, 'Max value should be greater than min value');

    if (max - min === 0) {
        return rainbow.getColor(0);
    }

    return rainbow.getColor(((value ?? 0) - min) / (max - min));
}
