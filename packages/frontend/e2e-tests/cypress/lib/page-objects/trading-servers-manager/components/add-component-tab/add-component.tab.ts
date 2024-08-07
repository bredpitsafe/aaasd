import { EAddComponentTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/add-component-tab/add-component.tab.selector';

import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { Select } from '../../../../base/elements/select';
import { customWait } from '../../../../web-socket/server';
import { confirmModal } from '../../../common/confirm.modal';
import { contextMenu } from '../../../common/context.menu';
import { ETableRowSelectors } from '../../../common/table/table.row-selectors';

class AddComponentTab {
    readonly addComponentTab = new Input(EAddComponentTabSelectors.AddComponentTab);
    readonly nameInput = new Input(EAddComponentTabSelectors.NameInput);
    readonly typeSelector = new Input(EAddComponentTabSelectors.TypeSelector);
    readonly kindSelector = new Select(EAddComponentTabSelectors.KindSelector, false);
    readonly kindInput = new Input(EAddComponentTabSelectors.KindInput);
    readonly kindSwitch = new Button(EAddComponentTabSelectors.KindSwitch);
    readonly configInput = new Input(EAddComponentTabSelectors.ConfigInput);
    readonly createButton = new Button(EAddComponentTabSelectors.CreateButton);

    checkElementsExists(): void {
        this.nameInput.checkExists();
        this.typeSelector.checkExists();
        this.kindSwitch.checkExists();
        this.createButton.checkExists();
    }

    checkComponentSelect(componentType: string): void {
        this.typeSelector.contains(componentType);
    }

    setConfig(nameFile: string) {
        cy.readFile(nameFile).then((text) => {
            cy.get(EAddComponentTabSelectors.ConfigInput).type(text, { force: true, delay: 0 });
        });
    }

    deleteComponentByName(nameComponent: string): void {
        cy.get(ETableRowSelectors.NameRowText).contains(nameComponent).rightclick();
        contextMenu.contextMenu.containsClick('Remove');
        confirmModal.nameComponentInput.type(nameComponent);
        confirmModal.clickOkButton();
    }

    deletedCreatedComponent(): void {
        customWait(5);
        const componentNames: string[] = [];
        cy.get(ETableRowSelectors.NameRowText)
            .each(($row) => {
                const name = $row.text().trim();
                if (name.includes('Component_')) {
                    componentNames.push(name);
                }
            })
            .then(() => {
                componentNames.forEach((name) => {
                    componentNames.push(name);
                    this.deleteComponentByName(name);
                    customWait(5);
                });
            });
    }
}

export const addComponentTab = new AddComponentTab();
