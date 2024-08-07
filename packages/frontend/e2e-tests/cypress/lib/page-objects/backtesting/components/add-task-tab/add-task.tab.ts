import { testSelector } from '@frontend/common/e2e';
import { EBacktestingSelectors } from '@frontend/common/e2e/selectors/backtesting/backtesting.page.selectors';
import { EAddTaskTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/add-task-tab/add-task.tab.selectors';
import { EMainMenuModalSelectors } from '@frontend/common/e2e/selectors/main-menu.modal.selectors';

import { getUuid } from '../../../../../support/data/random';
import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { Select } from '../../../../base/elements/select';
import { Text } from '../../../../base/elements/text';
import { EBacktestingPageSelectors } from '../../backtesting.page';

class AddTaskTab {
    readonly tabButton = new Button(EAddTaskTabSelectors.TabButton, false);
    readonly addTaskTab = new Text(EAddTaskTabSelectors.AddTaskTab, false);
    readonly createAndRunButton = new Button(EAddTaskTabSelectors.CreateAndRunButton);
    readonly serverSelector = new Select(EMainMenuModalSelectors.StageSwitchSelector);
    readonly tabCommonButton = new Button(EAddTaskTabSelectors.CommonButton);
    readonly tabAddRobotButton = new Button(EAddTaskTabSelectors.AddRobotButton);
    readonly nameInput = new Input(EBacktestingSelectors.NameInput);
    readonly descriptionInput = new Input(EBacktestingSelectors.DescriptionInput);
    readonly scoreIndicatorInput = new Input(EBacktestingSelectors.ScoreIndicatorInput);
    readonly configTemplateInput = new Input(EAddTaskTabSelectors.ConfigTemplateInput);
    readonly nameRobotInput = new Input(EAddTaskTabSelectors.NameRobotInput);
    readonly kindRobotInput = new Input(EAddTaskTabSelectors.KindRobotInput);
    readonly templateVariablesInput = new Input(EAddTaskTabSelectors.TemplateVariablesInput);
    readonly configRobotInput = new Input(EAddTaskTabSelectors.ConfigRobotInput);
    readonly stateRobotInput = new Input(EAddTaskTabSelectors.StateRobotInput);
    readonly templateVariablesButton = new Input(EAddTaskTabSelectors.TemplateVariablesButton);

    addTaskSelectServer(nameServer: string) {
        cy.get(EAddTaskTabSelectors.AddTaskTab).within(() => {
            this.serverSelector.clickTypeTextAndEnter(nameServer);
        });
    }

    checkElementsVisible(name: string): void {
        cy.get(EBacktestingPageSelectors.TabsPanel).contains(name);
        this.createAndRunButton.checkVisible();
    }

    checkElementsNotExists(): void {
        this.createAndRunButton.checkNotExists();
    }

    checkVisibleCommonTab(): void {
        this.createAndRunButton.checkVisible();
        this.nameInput.checkVisible();
        this.descriptionInput.checkVisible();
        this.configTemplateInput.checkVisible();
    }

    checkVisibleRobotsTab(): void {
        this.nameRobotInput.checkVisible();
        this.kindRobotInput.checkVisible();
        this.configRobotInput.checkVisible();
    }

    setTemplateConfig(nameFile: string) {
        this.setConfig(nameFile, this.configTemplateInput);
    }

    setRobotsConfig(nameFile: string) {
        this.setConfig(nameFile, this.configRobotInput);
    }

    clearFormTask() {
        cy.get(EAddTaskTabSelectors.AddTaskTab).within(() => {
            cy.get(testSelector(EBacktestingSelectors.NameInput)).clear();
            cy.get(testSelector(EBacktestingSelectors.DescriptionInput)).clear();
            cy.get(EBacktestingSelectors.DeleteScoreIndicatorButton).click();
        });
    }

    setTemplateVariables(value: string) {
        cy.get(EAddTaskTabSelectors.AddTaskTab).within(() => {
            cy.get(testSelector(EAddTaskTabSelectors.TemplateVariablesInput))
                .get(EAddTaskTabSelectors.ConfigInput)
                .type(value, { force: true });
        });
    }

    selectTemplateVariablesConfig() {
        cy.get(EAddTaskTabSelectors.AddTaskTab).within(() => {
            this.templateVariablesButton.clickForce();
        });
    }

    selectRobotTab(robotName: string) {
        cy.get(EAddTaskTabSelectors.AddTaskTab).within(() => {
            cy.get(EAddTaskTabSelectors.TabButton).contains(robotName).click({ force: true });
        });
    }

    selectCommonTab() {
        cy.get(EAddTaskTabSelectors.AddTaskTab).within(() => {
            this.tabCommonButton.get().first().click({ force: true });
        });
    }

    clearConfigTaskFieldByName(nameInput: string) {
        let fieldLocator: string;
        switch (nameInput) {
            case 'Config template':
                fieldLocator = testSelector(EAddTaskTabSelectors.ConfigTemplateInput);
                break;
            case 'Robot Config':
                fieldLocator = testSelector(EAddTaskTabSelectors.ConfigRobotInput);
                break;
        }
        cy.get(EAddTaskTabSelectors.AddTaskTab).within(() => {
            cy.get(fieldLocator)
                .get(EAddTaskTabSelectors.ConfigInput)
                .first()
                .click({ force: true })
                .focused()
                .type('{selectall}')
                .clear();
        });
    }

    clearTaskFieldByName(nameInput: string) {
        let fieldLocator: string;
        switch (nameInput) {
            case 'Robot Name':
                fieldLocator = testSelector(EAddTaskTabSelectors.NameRobotInput);
                break;
            case 'Robot Kind':
                fieldLocator = testSelector(EAddTaskTabSelectors.KindRobotInput);
                break;
            case 'Name':
                fieldLocator = testSelector(EBacktestingSelectors.NameInput);
                break;
            case 'Description':
                fieldLocator = testSelector(EBacktestingSelectors.DescriptionInput);
                break;
        }
        cy.get(EAddTaskTabSelectors.AddTaskTab).within(() => cy.get(fieldLocator).clear());
    }

    setTaskName(value: string) {
        cy.get(EAddTaskTabSelectors.AddTaskTab).within(() =>
            cy.get(testSelector(EBacktestingSelectors.NameInput)).type(value),
        );
    }

    setTaskDescription(value: string) {
        cy.get(EAddTaskTabSelectors.AddTaskTab).within(() =>
            cy.get(testSelector(EBacktestingSelectors.DescriptionInput)).type(value),
        );
    }

    setTaskScoreIndicator(value: string) {
        cy.get(EAddTaskTabSelectors.AddTaskTab).within(() =>
            cy.get(testSelector(EBacktestingSelectors.ScoreIndicatorInput)).type(value),
        );
    }

    setTaskForm(name: string) {
        const random = getUuid();
        this.setTaskName(name + random);
        this.setTaskDescription('Description' + random);
        this.setTaskScoreIndicator('ScoreIndicator' + random);
        cy.wrap(name + random).as('nameTask');
        cy.wrap('Description' + random).as('description');
        cy.wrap('ScoreIndicator' + random).as('scoreIndicator');
    }

    private setConfig(nameFile: string, element: Input) {
        cy.readFile(nameFile).then((text) => {
            cy.get(EAddTaskTabSelectors.AddTaskTab).within(() => {
                element
                    .get()
                    .get(EAddTaskTabSelectors.ConfigInput)
                    .first()
                    .type(text, { force: true, delay: 0 });
            });
        });
    }
}

export const addTaskTab = new AddTaskTab();
