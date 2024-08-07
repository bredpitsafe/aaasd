import { createTestProps } from '@frontend/common/e2e';
import { EAddTaskTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/add-task-tab/add-task.tab.selectors';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { DisplayAmount } from './DisplayAmount';
import {
    cnFullWidthRow,
    cnInstrumentInfo,
    cnLeftLabelValueData,
    cnRightLabelValueData,
} from './style.css';

export const DisplayAmounts = memo(
    ({
        displayLotAmount,
        displayStepAmount,
        displayOrderAmount,
        displayMaxOrderAmount,
        displayBalance,
        displayReferenceBalance,
        displayPosition,
    }: Record<
        | 'displayLotAmount'
        | 'displayStepAmount'
        | 'displayOrderAmount'
        | 'displayMaxOrderAmount'
        | 'displayBalance'
        | 'displayReferenceBalance'
        | 'displayPosition',
        undefined | string
    >) => (
        <div
            className={cnInstrumentInfo}
            {...createTestProps(EAddTaskTabSelectors.InstrumentLabel)}
        >
            {(!isNil(displayLotAmount) ||
                !isNil(displayStepAmount) ||
                !isNil(displayOrderAmount) ||
                !isNil(displayMaxOrderAmount)) && (
                <>
                    <DisplayAmount
                        className={cnLeftLabelValueData}
                        labelText="Order Amount"
                        value={displayOrderAmount}
                    />

                    <DisplayAmount
                        className={cnLeftLabelValueData}
                        labelText="Max Order Amount"
                        value={displayMaxOrderAmount}
                    />

                    <DisplayAmount
                        className={cnRightLabelValueData}
                        labelText="Amount Multiplier"
                        value={`1 = ${displayLotAmount}`}
                    />

                    <DisplayAmount
                        className={cnRightLabelValueData}
                        labelText="Amount Step"
                        value={displayStepAmount}
                    />

                    <div className={cnFullWidthRow} />
                </>
            )}

            {(!isNil(displayBalance) ||
                !isNil(displayReferenceBalance) ||
                !isNil(displayPosition)) && (
                <>
                    <DisplayAmount
                        className={cnLeftLabelValueData}
                        labelText="Balance"
                        value={displayBalance}
                    />
                    <DisplayAmount
                        className={cnRightLabelValueData}
                        labelText="Reference balance"
                        value={displayReferenceBalance}
                    />
                    <DisplayAmount
                        className={cnLeftLabelValueData}
                        labelText="Position"
                        value={displayPosition}
                    />
                </>
            )}
        </div>
    ),
);
