import { prepareImportableGrid, prepareImportableTable } from './parse';
import {
    defaultUrl,
    formulaParsedTable,
    formulaTableConfig,
    fullFeatureGridConfig,
    fullFeatureParsedGrid,
    fullFeatureParsedTable,
    fullFeatureTableConfig,
    indicatorsGridConfig,
    indicatorsParsedGrid,
    indicatorsParsedTable,
    indicatorsTableConfig,
    templateFeatureGridConfig,
    templateFeatureParsedGrid,
    templateParsedTable,
    templateTableConfig,
} from './parse.test-data';

describe('Test for PegJS parsers', () => {
    let originalCSS: typeof CSS;

    beforeAll(() => {
        originalCSS = global.CSS;
        global.CSS = {
            supports() {
                return true;
            },
        } as unknown as typeof CSS;
    });

    afterAll(() => {
        global.CSS = originalCSS;
    });

    describe('Table', () => {
        test('Config parse', () => {
            expect(prepareImportableTable(fullFeatureTableConfig, defaultUrl)).toMatchObject(
                fullFeatureParsedTable,
            );
        });

        test('Check used indicators', () => {
            expect(prepareImportableTable(indicatorsTableConfig, defaultUrl)).toMatchObject(
                indicatorsParsedTable,
            );
        });

        test('Check alive formula', () => {
            expect(prepareImportableTable(formulaTableConfig, defaultUrl)).toMatchObject(
                formulaParsedTable,
            );
        });

        test('Check cell template', () => {
            expect(prepareImportableTable(templateTableConfig, defaultUrl)).toMatchObject(
                templateParsedTable,
            );
        });
    });

    describe('Grid', () => {
        test('Config parse', () => {
            expect(prepareImportableGrid(fullFeatureGridConfig, defaultUrl)).toMatchObject(
                fullFeatureParsedGrid,
            );
        });

        test('Check used indicators', () => {
            expect(prepareImportableGrid(indicatorsGridConfig, defaultUrl)).toMatchObject(
                indicatorsParsedGrid,
            );
        });

        test('Check cell template', () => {
            expect(prepareImportableGrid(templateFeatureGridConfig, defaultUrl)).toMatchObject(
                templateFeatureParsedGrid,
            );
        });
    });
});
