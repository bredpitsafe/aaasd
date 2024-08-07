import { createTestProps } from '../../../../index';

export enum EDetailsTabSelectors {
    DetailsTab = '[class*="DetailsTab"]',
    UpdateButton = 'updateButton',
    RunAgainTaskButton = 'runAgainTaskButton',
    CloneTaskButton = 'cloneTaskButton',
    DeleteTaskButton = 'deleteTaskButton',
    StopTaskButton = 'stopTaskButton',
    ScoreIndicatorInput = '[class*="DetailsTab"] [data-test="scoreIndicatorInput"]',
}

export const DetailsTabProps = {
    [EDetailsTabSelectors.UpdateButton]: createTestProps(EDetailsTabSelectors.UpdateButton),
    [EDetailsTabSelectors.StopTaskButton]: createTestProps(EDetailsTabSelectors.StopTaskButton),
    [EDetailsTabSelectors.CloneTaskButton]: createTestProps(EDetailsTabSelectors.CloneTaskButton),
    [EDetailsTabSelectors.DeleteTaskButton]: createTestProps(EDetailsTabSelectors.DeleteTaskButton),
    [EDetailsTabSelectors.RunAgainTaskButton]: createTestProps(
        EDetailsTabSelectors.RunAgainTaskButton,
    ),
};
