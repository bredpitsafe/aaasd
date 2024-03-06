import { createTestProps } from '../../../../index';

export enum EAddTaskTabSelectors {
    AddTaskTab = '[class*="addTaskTab"]',
    TabButton = '[class*="ant-tabs-tab"]',
    ConfigInput = 'div.overflow-guard > textarea',
    CreateAndRunButton = 'createAndRunButton',
    CommonButton = 'commonButton',
    AddRobotButton = 'addRobotButton',
    TemplateVariablesInput = 'templateVariablesInput',
    ConfigTemplateInput = 'configTemplateInput',
    NameRobotInput = 'nameRobotInput',
    KindRobotInput = 'kindRobotInput',
    ConfigRobotInput = 'configRobotInput',
    StateRobotInput = 'stateRobotInput',
    TemplateVariablesButton = 'templateVariablesButton',
}

export const EAddTaskTabProps = {
    [EAddTaskTabSelectors.CreateAndRunButton]: createTestProps(
        EAddTaskTabSelectors.CreateAndRunButton,
    ),
    [EAddTaskTabSelectors.CommonButton]: createTestProps(EAddTaskTabSelectors.CommonButton),
    [EAddTaskTabSelectors.AddRobotButton]: createTestProps(EAddTaskTabSelectors.AddRobotButton),
    [EAddTaskTabSelectors.TemplateVariablesInput]: createTestProps(
        EAddTaskTabSelectors.TemplateVariablesInput,
    ),
    [EAddTaskTabSelectors.ConfigTemplateInput]: createTestProps(
        EAddTaskTabSelectors.ConfigTemplateInput,
    ),
    [EAddTaskTabSelectors.NameRobotInput]: createTestProps(EAddTaskTabSelectors.NameRobotInput),
    [EAddTaskTabSelectors.KindRobotInput]: createTestProps(EAddTaskTabSelectors.KindRobotInput),
    [EAddTaskTabSelectors.ConfigRobotInput]: createTestProps(EAddTaskTabSelectors.ConfigRobotInput),
    [EAddTaskTabSelectors.StateRobotInput]: createTestProps(EAddTaskTabSelectors.StateRobotInput),
    [EAddTaskTabSelectors.TemplateVariablesButton]: createTestProps(
        EAddTaskTabSelectors.TemplateVariablesButton,
    ),
};
