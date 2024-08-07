import { PositiveCases } from './converter.test-data';
import { convertXMLToDashboard } from './converters';

describe('Smoke tests for Dashboard XML parse', () => {
    test.each(PositiveCases)('Test case - %#', async (dashboardXml, dashboard) => {
        expect(await convertXMLToDashboard(dashboardXml)).toMatchObject(dashboard);
    });
});
