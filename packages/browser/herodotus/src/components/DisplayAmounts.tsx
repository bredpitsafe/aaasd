import { createTestProps } from '@frontend/common/e2e';
import { EAddTaskTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/add-task-tab/add-task.tab.selectors';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { DisplayAmount } from './DisplayAmount';
import {
    cnInstrumentInfo,
    cnInstrumentInfoContainerLotAmount,
    cnInstrumentInfoContainerOrderAmountLots,
    cnInstrumentInfoContainerOrderMaxAmount,
    cnInstrumentInfoContainerStepAmount,
} from './style.css';

export const DisplayAmounts = memo(
    ({
        displayLotAmount,
        displayStepAmount,
        displayOrderAmount,
        displayMaxOrderAmount,
    }: Record<
        'displayLotAmount' | 'displayStepAmount' | 'displayOrderAmount' | 'displayMaxOrderAmount',
        undefined | string
    >) =>
        isNil(displayLotAmount) &&
        isNil(displayStepAmount) &&
        isNil(displayOrderAmount) &&
        isNil(displayMaxOrderAmount) ? null : (
            <div
                className={cnInstrumentInfo}
                {...createTestProps(EAddTaskTabSelectors.InstrumentLabel)}
            >
                <DisplayAmount
                    className={cnInstrumentInfoContainerOrderAmountLots}
                    labelText="Order Amount"
                    value={displayOrderAmount}
                />

                <DisplayAmount
                    className={cnInstrumentInfoContainerOrderMaxAmount}
                    labelText="Max Order Amount"
                    value={displayMaxOrderAmount}
                />

                <DisplayAmount
                    className={cnInstrumentInfoContainerLotAmount}
                    labelText="Amount Multiplier"
                    value={`1 = ${displayLotAmount}`}
                />

                <DisplayAmount
                    className={cnInstrumentInfoContainerStepAmount}
                    labelText="Amount Step"
                    value={displayStepAmount}
                />
            </div>
        ),
);
