import { EBacktestingCardModalSelectors } from '@frontend/common/e2e/selectors/dashboard/backtesting.card.modal.selectors';

import { BasePage } from '../../base.page';
import { Text } from '../../base/elements/text';
import { EPagesUrl } from '../../interfaces/url-interfaces';

const PAGE_URL = EPagesUrl.dashboard;

class BacktestingCardModal extends BasePage {
    readonly backtestingCard = new Text(EBacktestingCardModalSelectors.BacktestingCard);

    constructor() {
        super(PAGE_URL);
    }
}

export const backtestingCardModal = new BacktestingCardModal();
