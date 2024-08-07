import { createTestProps } from '../../index';

export enum EBacktestingSelectors {
    App = 'appBacktesting',
    UpdateButton = 'updateButton',
    NameInput = 'nameInput',
    DescriptionInput = 'descriptionInput',
    ScoreIndicatorInput = 'scoreIndicatorInput',
    CopyRobotsButton = 'CopyRobotsButton',
    SaveScoreIndicatorButton = 'saveScoreIndicatorButton',
    DeleteScoreIndicatorButton = '[data-test=scoreIndicatorInput] [class*="remove"]',
}

export const BacktestingProps = {
    [EBacktestingSelectors.App]: createTestProps(EBacktestingSelectors.App),
    [EBacktestingSelectors.CopyRobotsButton]: createTestProps(
        EBacktestingSelectors.CopyRobotsButton,
    ),
    [EBacktestingSelectors.NameInput]: createTestProps(EBacktestingSelectors.NameInput),
    [EBacktestingSelectors.UpdateButton]: createTestProps(EBacktestingSelectors.UpdateButton),
    [EBacktestingSelectors.DescriptionInput]: createTestProps(
        EBacktestingSelectors.DescriptionInput,
    ),
    [EBacktestingSelectors.ScoreIndicatorInput]: createTestProps(
        EBacktestingSelectors.ScoreIndicatorInput,
    ),
    [EBacktestingSelectors.SaveScoreIndicatorButton]: createTestProps(
        EBacktestingSelectors.SaveScoreIndicatorButton,
    ),
};
