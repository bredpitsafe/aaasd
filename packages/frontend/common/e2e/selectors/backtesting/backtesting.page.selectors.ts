import { createTestProps } from '../../index';

export enum EBacktestingSelectors {
    App = 'appBacktesting',
    UpdateButton = 'updateButton',
    NameInput = 'nameInput',
    DescriptionInput = 'descriptionInput',
    ScoreIndicatorInput = 'scoreIndicatorInput',
    DeleteScoreIndicatorInput = '[data-test=scoreIndicatorInput] [class="ant-select-selection-item-remove"]',
}

export const BacktestingProps = {
    [EBacktestingSelectors.App]: createTestProps(EBacktestingSelectors.App),
    [EBacktestingSelectors.NameInput]: createTestProps(EBacktestingSelectors.NameInput),
    [EBacktestingSelectors.UpdateButton]: createTestProps(EBacktestingSelectors.UpdateButton),
    [EBacktestingSelectors.DescriptionInput]: createTestProps(
        EBacktestingSelectors.DescriptionInput,
    ),
    [EBacktestingSelectors.ScoreIndicatorInput]: createTestProps(
        EBacktestingSelectors.ScoreIndicatorInput,
    ),
};
