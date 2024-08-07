import type { TSocketStruct, TSocketURL } from '../../types/domain/sockets.ts';
import { getSocketUrlHash } from './getSocketUrlHash.ts';

test.each([
    [null, '29172c1a'],
    [undefined, '29172c1a'],
    ['some.url' as TSocketURL, '9d61812a'],
    [{ name: 'unknown', url: 'some.url' } as TSocketStruct, '9d61812a'],
])('%# getSocketUrlHash', (value, expected) => {
    expect(getSocketUrlHash(value)).toBe(expected);
});
