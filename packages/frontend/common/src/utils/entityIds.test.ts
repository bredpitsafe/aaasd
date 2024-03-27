import { isNil } from 'lodash-es';

import type { TAssetEntityId, TVirtualAccountEntityId } from '../types/domain/entityIds';
import { entityAssetIdToAssetId, entityVirtualAccountIdToAccountName } from './entityIds.ts';
import { logger } from './Tracing';

jest.mock('./Tracing', () => ({
    logger: { child: jest.fn() },
}));

const error = jest.fn();
const warn = jest.fn();

describe('Parse entity IDs', () => {
    beforeEach(() => {
        (logger.child as jest.MockedFn<any>)
            .mockClear()
            .mockImplementation(() => ({ error, warn }));
        error.mockClear();
        warn.mockClear();
    });

    test.each([
        {
            entityId: 'a:123:bbf',
            expected: 123,
        },
        {
            entityId: 'a:777:::::::',
            expected: 777,
        },
        {
            entityId: 'x:777:::::::',
            warnMessage: `Entity "x:777:::::::" should have "a" fingerprint, but has "x"`,
            expected: 777,
        },
        {
            entityId: 'x:777:',
            errorMessage: `Entity "x:777:" can't be parsed`,
        },

        {
            entityId: '',
            errorMessage: `Entity "" can't be parsed`,
        },
        {
            entityId: ':777:::::::',
            errorMessage: `Entity ":777:::::::" can't be parsed`,
        },
        {
            entityId: 'a:bbb:::::::',
            errorMessage: `Entity "a:bbb:::::::" can't be parsed`,
        },
        {
            entityId: 'a:777',
            errorMessage: `Entity "a:777" can't be parsed`,
        },
        {
            entityId: 'a::777',
            errorMessage: `Entity "a::777" can't be parsed`,
        },
        {
            entityId: 'a:777d:',
            errorMessage: `Entity "a:777d:" can't be parsed`,
        },
        {
            entityId: 'a::::777:::::::',
            errorMessage: `Entity "a::::777:::::::" can't be parsed`,
        },
    ] as unknown as {
        entityId: TAssetEntityId;
        warnMessage?: string;
        errorMessage?: string;
        expected?: number;
    }[])(
        'entityAssetIdToAssetId "$entityId"',
        function ({ entityId, warnMessage, errorMessage, expected }) {
            expect(entityAssetIdToAssetId(entityId)).toEqual(expected);
            if (!isNil(warnMessage)) {
                expect(warn.mock.calls).toHaveLength(1);
                expect(warn.mock.calls[0][0]).toBe(warnMessage);
            }
            if (!isNil(errorMessage)) {
                expect(error.mock.calls).toHaveLength(1);
                expect(error.mock.calls[0][0]).toBe(errorMessage);
            }
        },
    );

    test.each([
        {
            entityId: 'a:123:bbf',
            expected: 'bbf',
            warnMessage: `Entity "a:123:bbf" should have "V" fingerprint, but has "a"`,
        },
        {
            entityId: 'v:123:bbf',
            expected: 'bbf',
            warnMessage: `Entity "v:123:bbf" should have "V" fingerprint, but has "v"`,
        },
        {
            entityId: 'V:123:bbf',
            expected: 'bbf',
        },
        {
            entityId: 'V:777',
            errorMessage: `Entity "V:777" can't be parsed`,
        },
        {
            entityId: 'V::777',
            errorMessage: `Entity "V::777" can't be parsed`,
        },
        {
            entityId: 'V:777:::::::',
            expected: '::::::',
        },
        {
            entityId: 'V:777:name:name:name',
            expected: 'name:name:name',
        },
        ,
        {
            entityId: 'V:777::::name.name.name',
            expected: ':::name.name.name',
        },
    ] as unknown as {
        entityId: TVirtualAccountEntityId;
        warnMessage?: string;
        errorMessage?: string;
        expected?: number;
    }[])(
        'entityVirtualAccountIdToAccountName "$entityId"',
        function ({ entityId, warnMessage, errorMessage, expected }) {
            expect(entityVirtualAccountIdToAccountName(entityId)).toEqual(expected);
            if (!isNil(warnMessage)) {
                expect(warn.mock.calls).toHaveLength(1);
                expect(warn.mock.calls[0][0]).toBe(warnMessage);
            }
            if (!isNil(errorMessage)) {
                expect(error.mock.calls).toHaveLength(1);
                expect(error.mock.calls[0][0]).toBe(errorMessage);
            }
        },
    );
});
