import { describe, expect, it } from 'vitest';

import { fromDB, toDB } from './converters.ts';

const camelCaseObj = {
    id: 'test_uuid',
    legacyId: 567890,
    robotId: null,
};

const snakeCaseObj = {
    id: 'test_uuid',
    legacy_id: 567890,
    robot_id: null,
};

describe('DB converters', () => {
    it('toDB', () => {
        expect(toDB(camelCaseObj)).toEqual(snakeCaseObj);
    });

    it('fromDB', () => {
        expect(fromDB(snakeCaseObj)).toEqual(camelCaseObj);
    });

    it('fromDB (time fields)', () => {
        expect(
            fromDB({
                field: 'value',
                snake_case_field: null,
            }),
        ).toEqual({
            field: 'value',
            snakeCaseField: null,
        });
    });
});
