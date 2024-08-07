import { createTestProps } from '../../index';

export enum ETradingServersManagerSelectors {
    SelectorFilter = 'selectorFilter',
    App = 'appTradingServersManager',
    ContextMenuItemButton = '[class*="item__content"]',
}

export const TradingServersManagerProps = {
    [ETradingServersManagerSelectors.SelectorFilter]: createTestProps(
        ETradingServersManagerSelectors.SelectorFilter,
    ),
};
