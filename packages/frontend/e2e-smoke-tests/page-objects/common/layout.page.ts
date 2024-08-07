import { testSelector } from '@frontend/common/e2e';
import { EDashboardPageSelectors } from '@frontend/common/e2e/selectors/dashboard/dashboard.page.selectors';
import { ELayoutSelectors } from '@frontend/common/e2e/selectors/layout.selectors';
import { Page } from 'playwright';

class LayoutPage {
    readonly layoutContainerSelector = ELayoutSelectors.LayoutContainerSelector;
    readonly loadingAppText = ELayoutSelectors.LoadingAppText;
    readonly loadingImg = ELayoutSelectors.LoadingImg;
    readonly gridLayout = ELayoutSelectors.GridLayout;
    readonly dashboardCard = testSelector(EDashboardPageSelectors.DashboardCard);
}

export const layoutPage = new LayoutPage();

async function waitForLoadingToBeHidden(page: Page) {
    await page.waitForSelector(layoutPage.loadingAppText, {
        state: 'hidden',
        timeout: 60000,
    });
    await page.waitForSelector(layoutPage.loadingImg, {
        state: 'hidden',
        timeout: 60000,
    });
}

export { waitForLoadingToBeHidden };
