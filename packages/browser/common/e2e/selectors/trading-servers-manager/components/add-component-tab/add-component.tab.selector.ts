import { createTestProps } from '../../../../index';

export enum EAddComponentTabSelectors {
    AddComponentTab = 'addComponentTab',
    NameInput = 'nameInput',
    TypeSelector = 'typeSelector',
    KindForm = 'kindForm',
    KindSelector = '[data-test="kindForm"] [class="ant-select-selector"]',
    KindInput = 'kindInput',
    KindSwitch = 'kindSwitch',
    ConfigInput = '[data-test="addComponentTab"] [class*="inputarea"]',
    CreateButton = 'createButton',
}

export const AddComponentTabProps = {
    [EAddComponentTabSelectors.AddComponentTab]: createTestProps(
        EAddComponentTabSelectors.AddComponentTab,
    ),
    [EAddComponentTabSelectors.NameInput]: createTestProps(EAddComponentTabSelectors.NameInput),
    [EAddComponentTabSelectors.TypeSelector]: createTestProps(
        EAddComponentTabSelectors.TypeSelector,
    ),
    [EAddComponentTabSelectors.KindInput]: createTestProps(EAddComponentTabSelectors.KindInput),
    [EAddComponentTabSelectors.KindSelector]: createTestProps(
        EAddComponentTabSelectors.KindSelector,
    ),
    [EAddComponentTabSelectors.KindSwitch]: createTestProps(EAddComponentTabSelectors.KindSwitch),
    [EAddComponentTabSelectors.KindForm]: createTestProps(EAddComponentTabSelectors.KindForm),
    [EAddComponentTabSelectors.ConfigInput]: createTestProps(EAddComponentTabSelectors.ConfigInput),
    [EAddComponentTabSelectors.CreateButton]: createTestProps(
        EAddComponentTabSelectors.CreateButton,
    ),
};
