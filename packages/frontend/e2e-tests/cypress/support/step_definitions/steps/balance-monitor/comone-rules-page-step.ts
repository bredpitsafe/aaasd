import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { addAmountLimitsRuleTab } from '../../../../lib/page-objects/balance-monitor/components/add-amount-limits-rule/add-amount-limits-rule.tab';
import { addAutoTransferRuleTab } from '../../../../lib/page-objects/balance-monitor/components/add-auto-transfer-rule/add-auto-transfer-rule.tab';
import { addTransferBlockingRuleTab } from '../../../../lib/page-objects/balance-monitor/components/add-transfer-blocking-rule/add-transfer-blocking-rule.tab';
import {
    commonRuleTab,
    ERadioButtonType,
} from '../../../../lib/page-objects/balance-monitor/components/common-rule/common-rule.tab';

Given(`user selects {string} coin in the "Coin" selector`, (nameCoin: string) => {
    commonRuleTab.coinSelector.typeAndClickByText(nameCoin);
});

Given(`user selects {string} exchange in the "Source Exchange" selector`, (nameAccount: string) => {
    commonRuleTab.exchangeSelector.typeAndClickByTextFirst(nameAccount);
});

Given(
    `user selects {string} exchange in the "Destination Exchange" selector`,
    (nameAccount: string) => {
        commonRuleTab.exchangeSelector.typeAndClickByText(nameAccount);
    },
);

Given(
    /user (sees|not sees) "(.*?)" in the "Source Exchange" selector/,
    (checkContain: string, nameAccount: string) => {
        switch (checkContain) {
            case 'sees':
                commonRuleTab.exchangeSelector.clickFirst();
                commonRuleTab.exchangeSelector.checkListContainText(nameAccount);
                break;
            case 'not sees':
                commonRuleTab.exchangeSelector.clickFirst();
                commonRuleTab.exchangeSelector.checkListNotContainText(nameAccount);
                break;
        }
    },
);

Given(
    /user (sees|not sees) "(.*?)" in the "Destination Exchange" selector/,
    (checkContain: string, nameAccount: string) => {
        switch (checkContain) {
            case 'sees':
                commonRuleTab.exchangeSelector.clickLast();
                commonRuleTab.exchangeSelector.checkListContainText(nameAccount);
                break;
            case 'not sees':
                commonRuleTab.exchangeSelector.clickLast();
                commonRuleTab.exchangeSelector.checkListNotContainText(nameAccount);
                break;
        }
    },
);

Given(
    /user (sees|not sees) "(.*?)" in the "Source Account" selector/,
    (checkContain: string, nameAccount: string) => {
        switch (checkContain) {
            case 'sees':
                commonRuleTab.accountSelector.clickFirst();
                commonRuleTab.accountSelector.checkListContainText(nameAccount);
                break;
            case 'not sees':
                commonRuleTab.accountSelector.clickFirst();
                commonRuleTab.accountSelector.checkListNotContainText(nameAccount);
                break;
        }
    },
);

Given(
    /user (sees|not sees) "(.*?)" in the "Destination Account" selector/,
    (checkContain: string, nameAccount: string) => {
        switch (checkContain) {
            case 'sees':
                commonRuleTab.accountSelector.clickLast();
                commonRuleTab.accountSelector.checkListContainText(nameAccount);
                break;
            case 'not sees':
                commonRuleTab.accountSelector.clickLast();
                commonRuleTab.accountSelector.checkListNotContainText(nameAccount);
                break;
        }
    },
);

Given(`user clicks on the "Update" button in the {string} form`, (nameTab: string) => {
    switch (nameTab) {
        case 'Edit Amount Limit Rule':
            addAmountLimitsRuleTab.clickUpdateButton();
            break;
        case 'Edit Transfer Blocking Rule':
            addTransferBlockingRuleTab.clickUpdateButton();
            break;
        case 'Edit Auto Transfer Rule':
            addAutoTransferRuleTab.clickUpdateButton();
            break;
    }
});

Given(`user edits a rule in the {string} modal`, () => {
    commonRuleTab.editsRule();
});

Given(
    `user clicks on the {string} button near the {string} field`,
    (nameButton: string, nameInput: string) => {
        if (nameButton === 'All') {
            switch (nameInput) {
                case 'Coin':
                    commonRuleTab.clickOnRadioButtonByType(ERadioButtonType.Coin);
                    break;
                case 'Source Exchange':
                    commonRuleTab.clickOnRadioButtonByType(ERadioButtonType.SourceExchange);
                    break;
                case 'Source Account':
                    commonRuleTab.clickOnRadioButtonByType(ERadioButtonType.SourceAccount);
                    break;
                case 'Destination Exchange':
                    commonRuleTab.clickOnRadioButtonByType(ERadioButtonType.DestinationExchange);
                    break;
                case 'Destination Account':
                    commonRuleTab.clickOnRadioButtonByType(ERadioButtonType.DestinationAccount);
                    break;
            }
        } else if (nameButton === 'Transit') {
            switch (nameInput) {
                case 'Source Account':
                    commonRuleTab.clickOnRadioButtonByType(ERadioButtonType.TransitSourceAccount);
                    break;
                case 'Destination Account':
                    commonRuleTab.clickOnRadioButtonByType(
                        ERadioButtonType.TransitDestinationAccount,
                    );
                    break;
            }
        }
    },
);
