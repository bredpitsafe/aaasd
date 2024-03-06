import { trimRight } from './trim';

export function fixedLengthNumber(num: number, len = 6): string {
    const str = noExponents(num);

    if (str.length <= len) {
        return str;
    }

    const pointIndex = str.indexOf('.');

    if (pointIndex === -1) {
        return num.toExponential(len - 3); // 3 = e+N
    }

    if (pointIndex < len) {
        return trimRight(num.toFixed(len - pointIndex - 1), '0'); // 1 = .
    }

    if (pointIndex === len) {
        return str.substr(0, pointIndex);
    }

    return num.toExponential(len - 3);
}

// https://stackoverflow.com/questions/18719775/parsing-and-converting-exponential-values-to-decimal-in-javascript
function noExponents(n: number): string {
    const data = n.toString(10).split(/[eE]/);

    if (data.length == 1) return data[0];

    let z = '';
    let mag = Number(data[1]) + 1;
    const str = data[0].replace('.', '');
    const sign = n > 0 ? '' : '-';

    if (mag < 0) {
        z = sign + '0.';

        while (mag++) z += '0';

        return z + str.replace(/^\-/, '');
    }

    mag -= str.length;

    while (mag--) z += '0';

    return str + z;
}
