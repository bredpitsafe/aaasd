import { testSelector } from '@frontend/common/e2e';
import { ESendDataToAnalyseTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/send-data-to-analyse/send-data.page.selectors';

import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { SelectVirtualList } from '../../../../base/elements/selectVirtualList';
import { Text } from '../../../../base/elements/text';

const tabNameInput = ['Coin', 'Comment'];

class SendDataToAnalyseTab {
    readonly sendDataTab = new Text(ESendDataToAnalyseTabSelectors.SendDataTab);
    readonly coinSelector = new SelectVirtualList(ESendDataToAnalyseTabSelectors.CoinSelector);
    readonly commentInput = new Input(ESendDataToAnalyseTabSelectors.CommentInput);
    readonly sendButton = new Button(ESendDataToAnalyseTabSelectors.SendButton);
    readonly clearButton = new Button(ESendDataToAnalyseTabSelectors.ClearButton);

    checkVisibleTab(): void {
        const selector = testSelector(ESendDataToAnalyseTabSelectors.SendDataTab);
        for (const value of tabNameInput) {
            cy.contains(selector, value);
        }
    }
}

export const sendDataToAnalyseTab = new SendDataToAnalyseTab();
