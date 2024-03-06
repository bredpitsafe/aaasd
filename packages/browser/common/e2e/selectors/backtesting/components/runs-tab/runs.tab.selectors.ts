import { createTestProps } from '../../../../index';

export enum ERunsTabSelectors {
    RunsTab = '[class*="RunsTab"]',
    SaveScoreIndicatorButton = 'saveScoreIndicatorButton',
    ScoreIndicatorSearchInput = 'scoreIndicatorSearchInput',
    DeleteScoreIndicatorButton = '[data-test="scoreIndicatorSearchInput"] [class="ant-select-selection-item-remove"]',
}

export const RunsTabProps = {
    [ERunsTabSelectors.SaveScoreIndicatorButton]: createTestProps(
        ERunsTabSelectors.SaveScoreIndicatorButton,
    ),
    [ERunsTabSelectors.ScoreIndicatorSearchInput]: createTestProps(
        ERunsTabSelectors.ScoreIndicatorSearchInput,
    ),
};
