import { parsePartial } from './BFFSocket';

const WELL_FORMED_META = '{"correlation_id":1,"sent_size":2,"full_size":4}';
const WELL_FORMED_PARTIAL = `PARTIAL48${WELL_FORMED_META}{"`;
const PARTIAL_WITHOUT_META_LENGTH = `PARTIAL${WELL_FORMED_PARTIAL}{"`;
const PARTIAL_WITH_INVALID_META_LENGTH = `PARTIALFAIL${WELL_FORMED_PARTIAL}{"`;
const PARTIAL_WITH_WRONG_META_LENGTH = `PARTIAL40${WELL_FORMED_PARTIAL}{"`;
const PARTIAL_WITH_INVALID_META = 'PARTIAL34{"correlation_id":1,"sent_size":2}{"';
const PARTIAL_WITH_INVALID_META_JSON = 'PARTIAL33{"correlation_id":1,sent_size":2}{"';
const WELL_FORMED_PARTIAL_RESULT = {
    meta: { correlationId: 1, sentSize: 2, fullSize: 4 },
    body: '{"',
};

describe('Function parseWAPIMessage', () => {
    it('Should handle well-formed partial messages by returning a part of the message', () => {
        const parseResult = parsePartial(WELL_FORMED_PARTIAL);

        expect(parseResult).toEqual(WELL_FORMED_PARTIAL_RESULT);
    });

    it('Should respond with Fail if the "meta length" header is not valid', () => {
        const withoutMetaLength = parsePartial(PARTIAL_WITHOUT_META_LENGTH);
        const invalidMetaLength = parsePartial(PARTIAL_WITH_INVALID_META_LENGTH);
        const wrongMetaLength = parsePartial(PARTIAL_WITH_WRONG_META_LENGTH);

        expect(withoutMetaLength).toEqual(undefined);
        expect(invalidMetaLength).toEqual(undefined);
        expect(wrongMetaLength).toEqual(undefined);
    });

    it('Should respond with a Fail if invalid metadata is detected', () => {
        const invalidMeta = parsePartial(PARTIAL_WITH_INVALID_META);
        const invalidMetaJSON = parsePartial(PARTIAL_WITH_INVALID_META_JSON);

        expect(invalidMeta).toEqual(undefined);
        expect(invalidMetaJSON).toEqual(undefined);
    });
});
