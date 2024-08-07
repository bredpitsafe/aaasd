import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { productLogsLevelFilter } from '../../../../../../lib/page-objects/common/components/product-logs-tab/product-logs.level-filter';
import { productLogsTab } from '../../../../../../lib/page-objects/common/components/product-logs-tab/product-logs.tab';
import { productLogsTableRow } from '../../../../../../lib/page-objects/common/components/product-logs-tab/product-logs.table.row';
import { tableContextMenu } from '../../../../../../lib/page-objects/common/table/table.context-menu';
import { tableHeader } from '../../../../../../lib/page-objects/common/table/table.header';
import { indicatorsTableRow } from '../../../../../../lib/page-objects/trading-servers-manager/components/indicators-tab/indicators.table.row';
import { customWait } from '../../../../../../lib/web-socket/server';
import { getDataTask } from '../../../../../data/backtesting/getDataTack';

Given(
    /user clicks "Server Filter" button And (sees|not sees) the "Server Filter" panel/,
    (value: string) => {
        productLogsTab.serverFilterButton.containsClick('Server Filter');
        switch (value) {
            case 'not sees':
                productLogsTab.checkNotVisiblePanel();
                break;
            case 'sees':
                productLogsTab.checkVisiblePanel();
                break;
        }
    },
);

Given(/user adds "Level" filters And checks the addition "Level" filters/, () => {
    productLogsTab.levelSelector.typeAndClickByText('Info');
    productLogsLevelFilter.infoFilterText.checkVisible();
    productLogsTab.levelSelector.clear();
    productLogsTab.levelSelector.typeAndClickByText('Warn');
    productLogsLevelFilter.warnFilterText.checkVisible();
    productLogsTab.levelSelector.clear();
    productLogsTab.levelSelector.typeAndClickByText('Error');
    productLogsLevelFilter.errorFilterText.checkVisible();
    productLogsTab.levelSelector.clear();
    productLogsLevelFilter.checkVisibleLevelFilters();
});

Given(/user deletes "Level" filters And checks the deletion "Level" filters/, () => {
    productLogsLevelFilter.infoCloseButton.click();
    productLogsLevelFilter.infoFilterText.checkNotExists();
    productLogsLevelFilter.warnCloseButton.click();
    productLogsLevelFilter.warnFilterText.checkNotExists();
    productLogsLevelFilter.errorCloseButton.click();
    productLogsLevelFilter.errorFilterText.checkNotExists();
});

Given(`user opens the "Server Filter" panel`, () => {
    productLogsTab.serverFilterButton.containsClick('Server Filter');
});

Given(
    `user opens the header menu And selects the {string} column in the menu`,
    (nameColumn: string) => {
        tableHeader.tableHeaderText.get().last().rightclick();
        productLogsTab.addColumn([nameColumn]);
        productLogsTab.applyButton.click();
    },
);

Given(
    `user opens header menu And selects "Actor Key" and "Actor Group" columns in the menu`,
    () => {
        tableHeader.tableHeaderText.checkContain('Actor Key');
        tableHeader.tableHeaderText.checkContain('Actor Group');
    },
);

Given(`user sees a new column {string} in the table`, (nameColumn: string) => {
    tableHeader.tableHeaderText.checkContain(nameColumn);
});

Given(`user sees the "Level" filter`, () => {
    productLogsLevelFilter.checkVisibleLevelFilters();
});

Given(`user sees the logs with {string} level filter in the table`, (nameLevel: string) => {
    tableHeader.checkVisibleRowsTable();
    tableHeader.checkNotVisibleLoad();
    customWait(1);
    productLogsTableRow.checkAllRowsLevelContainText(nameLevel);
});

Given(`user selects {string} from the "Level" filter`, (nameLevel: string) => {
    productLogsTab.levelSelector.typeAndClickByText(nameLevel);
    productLogsTab.applyButtonClick();
    customWait(0.5);
});

Given(`user clears the "Level" filters`, () => {
    productLogsLevelFilter.clearLevelFilters();
});

Given(`user clears the {string} "Level" filter`, (nameLevel: string) => {
    productLogsLevelFilter.clearLevelFilter(nameLevel);
});

Given(`user opens the header menu`, () => {
    tableHeader.tableHeaderText.get().last().rightclick();
});

Given(`user types {string} data in the calendar`, (data: string) => {
    productLogsTab.sinceButton.clearAndTypeText(data);
    productLogsTab.sinceButton.type('{enter}');
});

Given(`user sees the header menu`, () => {
    tableContextMenu.headerMenu.checkVisible();
});

Given(`user checks the selection of tabs in the header menu`, () => {
    productLogsTab.checkVisibleFilterMenu();
    productLogsTab.checkVisibleColumnMenu();
    productLogsTab.checkVisibleAllColumnMenu();
});

Given(`user clicks on the "Apply" button in the filter`, () => {
    productLogsTab.applyButtonClick();
    customWait(1);
});

Given(
    `user types {string} in the {string} input of the filter "Include"`,
    (inputType: string, nameInput: string) => {
        switch (nameInput) {
            case 'Message':
                productLogsTab.includeMessageInput.typeAndClickByText(inputType);
                break;
            case 'Actor Key':
                productLogsTab.includeActorKeyInput.typeAndClickByText(inputType);
                break;
            case 'Actor Group':
                productLogsTab.includeActorGroupInput.typeAndClickByText(inputType);
                break;
        }
        productLogsTab.applyButtonClick();
        customWait(1);
    },
);

Given(
    `user sees types {string} in the {string} input of the filter "Include"`,
    (inputType: string, nameInput: string) => {
        switch (nameInput) {
            case 'Message':
                productLogsTab.includeMessageInput.checkContain(inputType);
                break;
            case 'Actor Key':
                productLogsTab.includeActorKeyInput.checkContain(inputType);
                break;
            case 'Actor Group':
                productLogsTab.includeActorGroupInput.checkContain(inputType);
                break;
        }
        productLogsTab.applyButtonClick();
        customWait(1);
    },
);

Given(
    `user types {string} in the {string} input of the filter "Exclude"`,
    (inputType: string, nameInput: string) => {
        switch (nameInput) {
            case 'Message':
                productLogsTab.excludeMessageInput.typeAndClickByText(inputType);
                break;
            case 'Actor Key':
                productLogsTab.excludeActorKeyInput.typeAndClickByText(inputType);
                break;
            case 'Actor Group':
                productLogsTab.excludeActorGroupInput.typeAndClickByText(inputType);
                break;
        }
        productLogsTab.applyButtonClick();
        customWait(1);
    },
);

Given(`user select column(s) by {string} name(s)`, (name: string) => {
    tableHeader.tableHeaderText.get().last().rightclick();
    const nameList = name.split(',');
    productLogsTab.addColumn(nameList);
});

Given(
    `user sees inputted {string} in the {string} column`,
    (inputType: string, nameInput: string) => {
        customWait(1);
        tableHeader.tableBody.checkNotContain('—');
        switch (nameInput) {
            case 'Message':
                productLogsTableRow.checkAllRowsMessageContainText(inputType);
                break;
            case 'Actor Key':
                productLogsTableRow.checkAllRowsActorKeyContainText(inputType);
                break;
            case 'Actor Group':
                productLogsTableRow.checkAllRowsActorGroupContainText(inputType);
                break;
        }
    },
);

Given(
    `user not sees inputted {string} in the {string} column`,
    (inputType: string, nameInput: string) => {
        customWait(1);
        switch (nameInput) {
            case 'Message':
                productLogsTableRow.checkAllRowsMessageNotContainText(inputType);
                break;
            case 'Actor Key':
                productLogsTableRow.checkAllRowsActorKeyNotContainText(inputType);
                break;
            case 'Actor Group':
                productLogsTableRow.checkAllRowsActorGroupNotContainText(inputType);
                break;
        }
    },
);

Given(
    `user not sees inputted {string} or {string} in the {string} column`,
    (oneInputType: string, twoInputType: string, nameInput: string) => {
        customWait(1);
        switch (nameInput) {
            case 'Message':
                productLogsTableRow.checkAllRowsMessageNotContainText(oneInputType);
                productLogsTableRow.checkAllRowsMessageNotContainText(twoInputType);
                break;
            case 'Actor Key':
                productLogsTableRow.checkAllRowsActorKeyNotContainText(oneInputType);
                productLogsTableRow.checkAllRowsActorKeyNotContainText(twoInputType);
                break;
            case 'Actor Group':
                productLogsTableRow.checkAllRowsActorGroupNotContainText(oneInputType);
                productLogsTableRow.checkAllRowsActorGroupNotContainText(twoInputType);
                break;
        }
    },
);

Given(`user sees the data of a {string} task in the "Product Logs" tab`, (statusTask: string) => {
    customWait(1);
    switch (statusTask) {
        case 'succeed':
            productLogsTableRow.checkDataSucceedTask();
            break;
        case 'failed':
            productLogsTableRow.checkDataFailedTask();
            break;
    }
});

Given(`user sees the task data in the "Product Logs" tab from "dataTask" object`, () => {
    const data = getDataTask();
    productLogsTableRow.checkDataCreatedTask(data);
});

Given(`user checks the date in the calendar from "dataTask" object`, () => {
    const data = getDataTask();
    productLogsTab.checkDateInCalendarByIndex(data, 0);
});

Given(`user remembers the first value in column {string}`, (nameColumn: string) => {
    tableHeader.checkNotVisibleLoad();
    tableHeader.checkVisibleRowsTable();
    switch (nameColumn) {
        case 'Message':
            productLogsTableRow.getActualLastMessage();
            break;
        case 'Time':
            productLogsTableRow.getActualLastTime();
            break;
    }
});

Given(`user sees that the first value in column {string} has changed`, (nameColumn: string) => {
    tableHeader.checkNotVisibleLoad();
    tableHeader.checkVisibleRowsTable();
    switch (nameColumn) {
        case 'Message':
            productLogsTableRow.checkNotLastMessage();
            break;
        case 'Time':
            productLogsTableRow.checkNotLastTime();
            break;
        case 'Row':
            indicatorsTableRow.checkNotFirstName();
            indicatorsTableRow.checkNotFirstRow();
            break;
    }
});

Given(`user sees that the new value in column "Message" has no duplicates`, () => {
    tableHeader.checkVisibleRowsTable();
    productLogsTableRow.checkNotDuplicateRecords();
});

Given(`user scrolls {string} in the {string} table`, (value: string) => {
    switch (value) {
        case 'down':
            productLogsTableRow.scrollToLastElementMultipleTimes(15);
            break;
        case 'up':
            productLogsTableRow.scrollToFirstElementMultipleTimes(5);
            break;
    }
});

Given(
    `user sees value: {string} in the {string} column on the "Product Logs" table`,
    (value: string, nameColumn: string) => {
        switch (nameColumn) {
            case 'Message':
                productLogsTableRow.messageRowText.checkContain(value);
                break;
            case 'Actor Key':
                productLogsTableRow.actorKeyText.checkContain(value);
                break;
            case 'Actor Group':
                productLogsTableRow.actorGroupText.checkContain(value);
                break;
        }
    },
);

Given(
    `user not sees value: {string} in the "Message" column on the "Product Logs" table`,
    (value: string) => {
        productLogsTableRow.messageRowText.checkNotContain(value);
    },
);

Given(
    `user sees the created "New Real Account" in the "Message" column in the "Product Logs" table`,
    () => {
        productLogsTableRow.checkVisibleCreatUser();
    },
);

Given(
    `user sees first value: {string} in the {string} column on the "Product Logs" table`,
    (value: string, nameColumn: string) => {
        switch (nameColumn) {
            case 'Message':
                productLogsTableRow.messageRowText.checkFirstContain(value);
                break;
            case 'Actor Key':
                productLogsTableRow.actorKeyText.checkFirstContain(value);
                break;
            case 'Actor Group':
                productLogsTableRow.actorGroupText.checkFirstContain(value);
                break;
        }
    },
);
