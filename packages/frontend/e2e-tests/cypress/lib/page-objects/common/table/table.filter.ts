import { ETableTabFilterSelectors } from '@frontend/common/e2e/selectors/table-tab.filter.selectors';

import { Button } from '../../../base/elements/button';
import { Input } from '../../../base/elements/input';
import { Text } from '../../../base/elements/text';

export class TableFilter {
    readonly tableMenu = new Text(ETableTabFilterSelectors.TableMenu);
    readonly tableFilterButton = new Button(ETableTabFilterSelectors.TableFilterButton);
    readonly nameInput = new Input(ETableTabFilterSelectors.NameInput);
    readonly dataInput = new Input(ETableTabFilterSelectors.DataInput);
    readonly realAccountInput = new Input(ETableTabFilterSelectors.RealAccountInput, false);
    readonly virtualAccountInput = new Input(ETableTabFilterSelectors.VirtualAccountInput, false);
    readonly activeTasksInput = new Input(ETableTabFilterSelectors.ActiveTasksInput, false);
    readonly archivedTasksInput = new Input(ETableTabFilterSelectors.ArchivedTasksInput, false);
    readonly switchButton = new Button(ETableTabFilterSelectors.SwitchButton);
    readonly csvButton = new Button(ETableTabFilterSelectors.CSVButton);
    readonly tsvButton = new Button(ETableTabFilterSelectors.TSVButton);
    readonly jsonButton = new Button(ETableTabFilterSelectors.JSONButton);
    readonly dashboardButton = new Button(ETableTabFilterSelectors.DashboardButton);
    readonly applyButton = new Button(ETableTabFilterSelectors.ApplyButton);
    readonly resetButton = new Button(ETableTabFilterSelectors.ResetButton);
    readonly warningIcon = new Button(ETableTabFilterSelectors.WarningIcon, false);

    checkElementsExists(): void {
        this.tableMenu.checkExists();
        this.nameInput.checkExists();
    }
}

export const tableFilter = new TableFilter();
