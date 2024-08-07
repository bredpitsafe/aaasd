import type { TSocketURL } from '../types/domain/sockets';
import { changeUrlSchema, changeUrlToSocketUrl, getValidSocketUrl, hasUrlSchema } from './url';

const urlsForCheckSchema: [string, boolean][] = [
    ['ws://asd', true],
    ['wss://asd', true],
    ['http://asd', true],
    ['https://asd', true],
    ['random://asd', true],
    ['wsh://asd', true],
    ['www.com', false],
];
const urlsForChangeSchema: [string, string, string][] = [
    ['ws://asd', 'wss', 'wss://asd'],
    ['http://asd', 'ws', 'ws://asd'],
    ['asd', 'https', 'https://asd'],
];

const urlsForWsSchema: [string, string, string][] = [
    ['ws://asd', 'wss', 'ws://asd'],
    ['wss://asd', 'wss', 'wss://asd'],
    ['http://asd', 'ws', 'ws://asd'],
    ['http://asd', 'wss', 'wss://asd'],
];

describe('URL', () => {
    it.each(urlsForCheckSchema)('hasUrlSchema', (url, v) => {
        expect(hasUrlSchema(url)).toEqual(v);
    });

    it.each(urlsForChangeSchema)('changeUrlSchema', (url, schema, result) => {
        expect(changeUrlSchema(url, schema)).toEqual(result);
    });

    it.each(urlsForWsSchema)('changeUrlToSocketUrl', (url, schema, result) => {
        expect(changeUrlToSocketUrl(url, schema)).toEqual(result);
    });

    describe('getValidSocketUrl', () => {
        const test = 'test/';
        const inputs = [test, `ws://${test}`, `wss://${test}`];

        it('gets valid socket url (unsecure location)', () => {
            const output = `ws://${test}`;

            inputs.forEach((input) => {
                expect(getValidSocketUrl(input as TSocketURL)).toBe(output);
            });
        });
    });
});
