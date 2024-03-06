import { OrderBookTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/order-book-tab/order-book.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { Text } from '../../../../base/elements/text';

class OrderBookTab {
    readonly selectInstrumentSelector = new Button(OrderBookTabSelectors.SelectInstrumentSelector);
    readonly instrumentButton = new Button(OrderBookTabSelectors.InstrumentButton);
    readonly platformTimeButton = new Button(OrderBookTabSelectors.PlatformTimeButton);
    readonly selectDateSelector = new Button(OrderBookTabSelectors.SelectDateSelector);
    readonly nanosecondInput = new Button(OrderBookTabSelectors.NanosecondInput);
    readonly orderBookDepthInput = new Text(OrderBookTabSelectors.OrderBookDepthInput);
    readonly applyButton = new Text(OrderBookTabSelectors.ApplyButton);

    checkElementsExists() {
        this.selectInstrumentSelector.checkExists();
        this.instrumentButton.checkExists();
        this.platformTimeButton.checkExists();
        this.selectDateSelector.checkExists();
        this.nanosecondInput.checkExists();
        this.orderBookDepthInput.checkExists();
        this.applyButton.checkExists();
    }
}

export const orderBookTab = new OrderBookTab();
