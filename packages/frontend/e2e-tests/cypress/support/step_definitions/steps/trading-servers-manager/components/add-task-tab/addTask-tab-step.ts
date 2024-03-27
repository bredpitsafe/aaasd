import { DataTable, Given } from '@badeball/cypress-cucumber-preprocessor';

import { TDataTaskHerodotus } from '../../../../../../lib/interfaces/herodotus-robot/dataTackHerodotus';
import { addTaskTab } from '../../../../../../lib/page-objects/trading-servers-manager/components/add-task-tab/add-task.tab';
import { customWait } from '../../../../../../lib/web-socket/server';
import { getDataTasksBinanceCoinSwap } from '../../../../../data/herodotus-robot/getDataTasksBinanceCoinSwap';
import { getDataTasksBinanceSpot } from '../../../../../data/herodotus-robot/getDataTasksBinanceSpot';
import { getDataTasksBinanceSwap } from '../../../../../data/herodotus-robot/getDataTasksBinanceSwap';
import { getDataTasksBithumbSpot } from '../../../../../data/herodotus-robot/getDataTasksBithumbSpot';
import { getDataTasksBybitSpot } from '../../../../../data/herodotus-robot/getDataTasksBybitSpot';
import { getDataTasksBybitSwap } from '../../../../../data/herodotus-robot/getDataTasksBybitSwap';
import { getDataTasksDeribit } from '../../../../../data/herodotus-robot/getDataTasksDeribit';
import { getDataTasksGateioSpot } from '../../../../../data/herodotus-robot/getDataTasksGateioSpot';
import { getDataTasksKrakenSpot } from '../../../../../data/herodotus-robot/getDataTasksKrakenSpot';
import { getDataTasksKucoinSpot } from '../../../../../data/herodotus-robot/getDataTasksKucoinSpot';
import { getDataTasksOkexSpot } from '../../../../../data/herodotus-robot/getDataTasksOkexSpot';
import { getDataTasksOkexSwap } from '../../../../../data/herodotus-robot/getDataTasksOkexSwap';
import { getDataTasksUpbitSpot } from '../../../../../data/herodotus-robot/getDataTasksUpbitSpot';
import { getDataTaskNewTask } from '../../../../../data/herodotus-terminal/getDataTaskNewTask';
import { findLCM, getRandomNumber, roundToFixed } from '../../../../../data/random';

let dataBuy: TDataTaskHerodotus;
let dataSell: TDataTaskHerodotus;
let dataBuyOne: TDataTaskHerodotus;
let dataBuyTwo: TDataTaskHerodotus;
let dataSellOne: TDataTaskHerodotus;
let dataSellTwo: TDataTaskHerodotus;
let indexAsset: number;
let amountLCM: number;
let amountLCMBuy: number;
let amountLCMSell: number;
let orderAmount: number;
let totalAmount: number;

Given(`user selects task type values:`, (dataTable: DataTable) => {
    customWait(1);
    dataTable.hashes().forEach((element) => {
        addTaskTab.baseAssetSelector.selectByText(element.baseAsset, 10000);
        addTaskTab.totalAmountInput.type(element.totalAmount);
        addTaskTab.taskTypeSelector.clickByText(element.task);
    });
});

Given(`user sets the {string} task type`, (taskType: string) => {
    addTaskTab.taskTypeSelector.clickByText(taskType);
    customWait(3);
});

Given(`user sets the task data:`, (dataTable: DataTable) => {
    customWait(1);
    dataTable.hashes().forEach((element) => {
        addTaskTab.baseAssetSelector.selectByText(element.baseAsset, 10000);
        addTaskTab.totalAmountInput.type(element.totalAmount);
        addTaskTab.exchangeSelector.selectByText(element.exchange);
        addTaskTab.accountSelector.selectByText(element.account);
        addTaskTab.instrumentSelector.clickAndType(element.instrument);
        addTaskTab.orderAmountInput.type(element.orderAmount);
        addTaskTab.maxPriceInput.type(element.maxPrice);
        addTaskTab.aggressionInput.type(element.aggression);
    });
});

Given(`user sets random data in the task:`, (dataTable: DataTable) => {
    let data: TDataTaskHerodotus;
    let indexAsset: number;
    let orderAmount: number;
    let totalAmount: number;
    let maxPrice: number;

    dataTable.hashes().forEach((element) => {
        switch (element.exchange) {
            case 'BinanceCoinSwap':
                data = getDataTasksBinanceCoinSwap();
                indexAsset = 0;
                break;
            case 'BinanceSpot':
                data = getDataTasksBinanceSpot();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'BinanceSwap':
                data = getDataTasksBinanceSwap();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'BithumbSpot':
                data = getDataTasksBithumbSpot();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'BybitSpot':
                data = getDataTasksBybitSpot();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'BybitSwap':
                data = getDataTasksBybitSwap();
                indexAsset = getRandomNumber(0, 1);
                break;
            case 'Deribit':
                data = getDataTasksDeribit();
                indexAsset = getRandomNumber(0, 1);
                break;
            case 'GateioSpot':
                data = getDataTasksGateioSpot();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'KrakenSpot':
                data = getDataTasksKrakenSpot();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'KucoinSpot':
                data = getDataTasksKucoinSpot();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'OkexSpot':
                data = getDataTasksOkexSpot();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'OkexSwap':
                data = getDataTasksOkexSwap();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'UpbitSpot':
                data = getDataTasksUpbitSpot();
                indexAsset = getRandomNumber(0, 1);
                break;
        }
        orderAmount = roundToFixed(data.amount[indexAsset] * getRandomNumber(1, 100), 10);
        totalAmount = roundToFixed(orderAmount * getRandomNumber(1, 10), 10);
        maxPrice = data.maxPrice[indexAsset] * getRandomNumber(1, 10);
        addTaskTab.baseAssetSelector.selectByText(data.baseAsset[indexAsset], 10000);

        customWait(2);
        addTaskTab.exchangeSelector.typeAndClickByText(element.exchange);
        addTaskTab.accountSelector.selectByText(element.account);
        addTaskTab.instrumentSelector.clickAndType(data.instrument[indexAsset]);

        addTaskTab.orderAmountInput.type(orderAmount.toString());
        addTaskTab.totalAmountInput.type(totalAmount.toString());
        addTaskTab.maxPriceInput.type(maxPrice.toString());
    });
});

Given(`user sets random data in the "BuySell" task:`, (dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        switch (element.exchangeBuy) {
            case 'BinanceSpot':
                dataBuy = getDataTasksBinanceSpot();
                dataSell = getDataTasksKucoinSpot();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'BinanceSwap':
                dataBuy = getDataTasksBinanceSwap();
                dataSell = getDataTasksOkexSwap();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'BithumbSpot':
                dataBuy = getDataTasksBithumbSpot();
                dataSell = getDataTasksUpbitSpot();
                indexAsset = getRandomNumber(0, 1);
                break;
            case 'BybitSpot':
                dataBuy = getDataTasksBybitSpot();
                dataSell = getDataTasksGateioSpot();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'BybitSwap':
                dataBuy = getDataTasksBybitSwap();
                dataSell = getDataTasksDeribit();
                indexAsset = getRandomNumber(0, 1);
                break;
            case 'Deribit':
                dataBuy = getDataTasksDeribit();
                dataSell = getDataTasksBybitSwap();
                indexAsset = getRandomNumber(0, 1);
                break;
            case 'GateioSpot':
                dataBuy = getDataTasksGateioSpot();
                dataSell = getDataTasksBinanceSpot();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'KrakenSpot':
                dataBuy = getDataTasksKrakenSpot();
                dataSell = getDataTasksOkexSpot();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'KucoinSpot':
                dataBuy = getDataTasksKucoinSpot();
                dataSell = getDataTasksBybitSpot();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'OkexSpot':
                dataBuy = getDataTasksOkexSpot();
                dataSell = getDataTasksKucoinSpot();
                indexAsset = getRandomNumber(0, 2);
                break;
            case 'OkexSwap':
                dataBuy = getDataTasksOkexSwap();
                dataSell = getDataTasksBinanceSwap();
                indexAsset = getRandomNumber(0, 2);
                break;
        }
        amountLCM = roundToFixed(
            findLCM(dataBuy.amount[indexAsset], dataSell.amount[indexAsset]),
            10,
        );
        orderAmount = roundToFixed(amountLCM * getRandomNumber(1, 100), 10);
        totalAmount = roundToFixed(orderAmount * getRandomNumber(1, 10), 10);
        addTaskTab.baseAssetSelector.selectByText(dataBuy.baseAsset[indexAsset], 10000);

        customWait(5);
        addTaskTab.setBuyInstruments(
            element.exchangeBuy,
            element.accountBuy,
            dataBuy.instrument[indexAsset],
        );

        addTaskTab.setSellInstruments(
            element.exchangeSell,
            element.accountSell,
            dataSell.instrument[indexAsset],
        );

        addTaskTab.orderAmountInput.type(orderAmount.toString());
        addTaskTab.totalAmountInput.type(totalAmount.toString());
    });
});

Given(
    `user sets random data in the "BuySell" task for two instruments:`,
    (dataTable: DataTable) => {
        dataTable.hashes().forEach((element) => {
            switch (element.exchangeBuyOne) {
                case 'BinanceSpot':
                    dataBuyOne = getDataTasksBinanceSpot();
                    dataSellOne = getDataTasksBybitSpot();
                    dataBuyTwo = getDataTasksKucoinSpot();
                    dataSellTwo = getDataTasksOkexSpot();
                    indexAsset = getRandomNumber(0, 2);
                    break;
                case 'BinanceSwap':
                    dataBuyOne = getDataTasksBinanceSwap();
                    dataSellOne = getDataTasksOkexSwap();
                    dataBuyTwo = getDataTasksBybitSwap();
                    dataSellTwo = getDataTasksDeribit();
                    indexAsset = getRandomNumber(0, 1);
                    break;
                case 'GateioSpot':
                    dataBuyOne = getDataTasksGateioSpot();
                    dataSellOne = getDataTasksKrakenSpot();
                    dataBuyTwo = getDataTasksKucoinSpot();
                    dataSellTwo = getDataTasksOkexSpot();
                    indexAsset = getRandomNumber(0, 2);
                    break;
            }
            amountLCMBuy = roundToFixed(
                findLCM(dataBuyOne.amount[indexAsset], dataBuyTwo.amount[indexAsset]),
                10,
            );
            amountLCMSell = roundToFixed(
                findLCM(dataSellOne.amount[indexAsset], dataSellTwo.amount[indexAsset]),
                10,
            );
            amountLCM = roundToFixed(findLCM(amountLCMBuy, amountLCMSell), 10);
            orderAmount = roundToFixed(amountLCM * getRandomNumber(1, 100), 10);
            totalAmount = roundToFixed(orderAmount * getRandomNumber(1, 10), 10);
            addTaskTab.baseAssetSelector.selectByText(dataBuyOne.baseAsset[indexAsset], 10000);

            customWait(5);
            addTaskTab.setBuyInstruments(
                element.exchangeBuyOne,
                element.accountBuyOne,
                dataBuyOne.instrument[indexAsset],
            );

            addTaskTab.setSellInstruments(
                element.exchangeSellOne,
                element.accountSellOne,
                dataSellOne.instrument[indexAsset],
            );

            addTaskTab.addBuyAndSellInstruments();

            addTaskTab.setBuyInstruments(
                element.exchangeBuyTwo,
                element.accountBuyTwo,
                dataBuyTwo.instrument[indexAsset],
            );

            addTaskTab.setSellInstruments(
                element.exchangeSellTwo,
                element.accountSellTwo,
                dataSellTwo.instrument[indexAsset],
            );

            addTaskTab.orderAmountInput.type(orderAmount.toString());
            addTaskTab.totalAmountInput.type(totalAmount.toString());
        });
    },
);

Given(
    `user sets random data in the "BuySell" task for two buy instruments and one sell instrument:`,
    (dataTable: DataTable) => {
        dataTable.hashes().forEach((element) => {
            switch (element.exchangeBuyOne) {
                case 'BinanceSpot':
                    dataBuyOne = getDataTasksBinanceSpot();
                    dataSellOne = getDataTasksBybitSpot();
                    dataBuyTwo = getDataTasksKucoinSpot();
                    indexAsset = getRandomNumber(0, 2);
                    break;
                case 'BinanceSwap':
                    dataBuyOne = getDataTasksBinanceSwap();
                    dataSellOne = getDataTasksOkexSwap();
                    dataBuyTwo = getDataTasksBybitSwap();
                    indexAsset = getRandomNumber(0, 1);
                    break;
                case 'GateioSpot':
                    dataBuyOne = getDataTasksGateioSpot();
                    dataSellOne = getDataTasksKrakenSpot();
                    dataBuyTwo = getDataTasksOkexSpot();
                    indexAsset = getRandomNumber(0, 2);
                    break;
            }
            amountLCMBuy = roundToFixed(
                findLCM(dataBuyOne.amount[indexAsset], dataBuyTwo.amount[indexAsset]),
                10,
            );
            amountLCM = roundToFixed(findLCM(amountLCMBuy, dataSellOne.amount[indexAsset]), 10);
            orderAmount = roundToFixed(amountLCM * getRandomNumber(1, 100), 10);
            totalAmount = roundToFixed(orderAmount * getRandomNumber(1, 10), 10);
            addTaskTab.baseAssetSelector.selectByText(dataBuyOne.baseAsset[indexAsset], 10000);

            customWait(5);
            addTaskTab.setBuyInstruments(
                element.exchangeBuyOne,
                element.accountBuyOne,
                dataBuyOne.instrument[indexAsset],
            );

            addTaskTab.setSellInstruments(
                element.exchangeSellOne,
                element.accountSellOne,
                dataSellOne.instrument[indexAsset],
            );

            addTaskTab.addBuyInstruments();

            addTaskTab.setBuyInstruments(
                element.exchangeBuyTwo,
                element.accountBuyTwo,
                dataBuyTwo.instrument[indexAsset],
            );

            addTaskTab.orderAmountInput.type(orderAmount.toString());
            addTaskTab.totalAmountInput.type(totalAmount.toString());
        });
    },
);

Given(
    `user sets random data in the "BuySell" task for one buy instruments and two sell instrument:`,
    (dataTable: DataTable) => {
        dataTable.hashes().forEach((element) => {
            switch (element.exchangeBuyOne) {
                case 'BinanceSpot':
                    dataBuyOne = getDataTasksBinanceSpot();
                    dataSellOne = getDataTasksBybitSpot();
                    dataSellTwo = getDataTasksKucoinSpot();
                    indexAsset = getRandomNumber(0, 2);
                    break;
                case 'BinanceSwap':
                    dataBuyOne = getDataTasksBinanceSwap();
                    dataSellOne = getDataTasksOkexSwap();
                    dataSellTwo = getDataTasksDeribit();
                    indexAsset = getRandomNumber(0, 1);
                    break;
                case 'GateioSpot':
                    dataBuyOne = getDataTasksGateioSpot();
                    dataSellOne = getDataTasksKrakenSpot();
                    dataSellTwo = getDataTasksOkexSpot();
                    indexAsset = getRandomNumber(0, 2);
                    break;
            }
            amountLCMSell = roundToFixed(
                findLCM(dataSellOne.amount[indexAsset], dataSellTwo.amount[indexAsset]),
                10,
            );
            amountLCM = roundToFixed(findLCM(dataBuyOne.amount[indexAsset], amountLCMSell), 10);
            orderAmount = roundToFixed(amountLCM * getRandomNumber(1, 100), 10);
            totalAmount = roundToFixed(orderAmount * getRandomNumber(1, 10), 10);
            addTaskTab.baseAssetSelector.selectByText(dataBuyOne.baseAsset[indexAsset], 10000);

            customWait(5);
            addTaskTab.setBuyInstruments(
                element.exchangeBuyOne,
                element.accountBuyOne,
                dataBuyOne.instrument[indexAsset],
            );

            addTaskTab.setSellInstruments(
                element.exchangeSellOne,
                element.accountSellOne,
                dataSellOne.instrument[indexAsset],
            );

            addTaskTab.addSellInstruments();

            addTaskTab.setSellInstruments(
                element.exchangeSellTwo,
                element.accountSellTwo,
                dataSellTwo.instrument[indexAsset],
            );

            addTaskTab.orderAmountInput.type(orderAmount.toString());
            addTaskTab.totalAmountInput.type(totalAmount.toString());
        });
    },
);

Given(`user sets a random valid roles in the instruments`, () => {
    const index = getRandomNumber(0, 1);
    switch (index) {
        case 0:
            addTaskTab.instrumentRoleSelector.typeAndClickByText('Hedge');
            break;
        case 1:
            addTaskTab.instrumentRoleSelector.typeAndClickByTextFirst('Hedge');
            break;
    }
});

Given(`user sets a random valid roles in the several instruments`, () => {
    const index = getRandomNumber(1, 2);
    addTaskTab.instrumentRoleSelector.clickByIndexAndSelectByText(0, 'Hedge');
    addTaskTab.instrumentRoleSelector.clickByIndexAndSelectByText(index, 'Hedge');
});

Given(`user not sees a set value in the "Add Task" form`, (dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        addTaskTab.addTaskTab.checkNotContain(element.baseAsset);
        addTaskTab.addTaskTab.checkNotContain(element.totalAmount);
        addTaskTab.addTaskTab.checkNotContain(element.exchange);
        addTaskTab.addTaskTab.checkNotContain(element.account);
        addTaskTab.addTaskTab.checkNotContain(element.instrument);
        addTaskTab.addTaskTab.checkNotContain(element.maxPrice);
        addTaskTab.addTaskTab.checkNotContain('click');
    });
    addTaskTab.taskTypeSelector.contains('Buy');
    addTaskTab.totalAmountInput.checkHaveValue('0');
    addTaskTab.orderAmountInput.checkHaveValue('0');
    addTaskTab.aggressionInput.checkHaveValue('0');
    addTaskTab.currencyType.contains('Reference');
});

Given(`user selects {string} asset`, (nameAsset: string) => {
    customWait(1);
    addTaskTab.baseAssetSelector.selectByText(nameAsset, 1000);
});

Given(`user selects "Buy" instruments values:`, (dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        addTaskTab.setBuyInstruments(element.exchange, element.account, element.instrument);
    });
});

Given(`user selects "Sell" instruments values:`, (dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        addTaskTab.setSellInstruments(element.exchange, element.account, element.instrument);
        addTaskTab.instrumentRoleSelector.clickByText(element.role);
    });
});

Given(`user selects second "Sell" instruments values:`, (dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        addTaskTab.setSellInstruments(element.exchange, element.account, element.instrument);
        addTaskTab.instrumentRoleSelector.clickByText(element.role);
    });
});

Given(`user sees the filled fields the "Add Task" tab`, () => {
    const taskData = getDataTaskNewTask();
    addTaskTab.taskTypeSelector.checkContain(taskData.typeTask);
    addTaskTab.baseAssetSelector.checkContain(taskData.assetTask);
    addTaskTab.totalAmountInput.checkHaveValue(taskData.amntTask);
    addTaskTab.orderAmountInput.checkHaveValue(taskData.orderSizeTask);
});

Given(`user selects value {string} in the "Currency Type" input`, (currencyType: string) => {
    addTaskTab.currencyType.clickByText(currencyType);
});

Given(`user sees value {string} in the {string} label`, (value: string, nameLabel) => {
    switch (nameLabel) {
        case 'Min Price':
            addTaskTab.maxPriceLabel.checkContain(value);
            break;
        case 'Order Amount':
            addTaskTab.orderAmountLabel.checkContain(value);
            break;
        case 'Total Amount':
            addTaskTab.totalAmountLabel.checkContain(value);
            break;
        case 'Order Amount Value':
        case 'Amount Multiplier':
        case 'Max Order Amount':
        case 'Amount Step':
            addTaskTab.instrumentLabel.checkContain(value);
            break;
    }
});

Given(`user sees convert value in the "Add Task" tab`, () => {
    addTaskTab.totalAmountLabel.contains('*');
    addTaskTab.totalAmountLabel.contains(' ~= ');
    addTaskTab.totalAmountLabel.contains('$');
});

Given(
    `user types the value of {string} in the {string} input`,
    (value: string, nameInput: string) => {
        switch (nameInput) {
            case 'Total Amount':
                addTaskTab.totalAmountInput.clearAndType(value);
                break;
            case 'Order Amount':
                addTaskTab.orderAmountInput.clearAndType(value);
                break;
            case 'Max Price':
                addTaskTab.maxPriceInput.clearAndType(value);
                break;
        }
    },
);

Given(`user sees the {string} error message on the task form`, (errorValue: string) => {
    switch (errorValue) {
        case 'Amount should be greater then 0':
            addTaskTab.totalAmountLabel.checkContain(errorValue);
            break;
        case 'Order Amount should be greater then 0':
            addTaskTab.orderAmountLabel.checkContain(errorValue);
            break;
        case 'Max Price should be greater then 0':
            addTaskTab.maxPriceLabel.checkContain(errorValue);
            break;
        case 'Order Amount is not a multiple of the amount step: 100 BTC':
            addTaskTab.orderAmountLabel.checkContain(errorValue);
            break;
    }
});

Given(`user not sees the {string} error message on the task form`, (errorValue: string) => {
    switch (errorValue) {
        case 'Amount should be greater then 0':
            addTaskTab.totalAmountLabel.checkNotContain(errorValue);
            break;
        case 'Order Amount should be greater then 0':
            addTaskTab.orderAmountLabel.checkNotContain(errorValue);
            break;
        case 'Max Price should be greater then 0':
            addTaskTab.maxPriceLabel.checkNotContain(errorValue);
            break;
        case 'Order Amount is not a multiple of the amount step: 100 BTC':
            addTaskTab.orderAmountLabel.checkNotContain(errorValue);
            break;
    }
});

Given(`user selects instruments values:`, (dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        addTaskTab.exchangeSelector.selectByText(element.exchange);
        addTaskTab.accountSelector.selectByText(element.account);
        addTaskTab.instrumentSelector.type(element.instrument);
        addTaskTab.instrumentSelector.selectsText(element.instrument);
    });
});

Given(`user sees labels in the "Instruments" form`, () => {
    addTaskTab.checkVisibleInstrumentLabel();
});

Given(`user selects {string} from the "Base Asset" selector`, (nameAsset: string) => {
    addTaskTab.baseAssetSelector.selectByText(nameAsset);
});

Given(`user clicks on the "Add" button and adds a new instruments`, () => {
    addTaskTab.addInstrumentButton.click();
});

Given(`clicks on the "Add" button for the "Buy" instrument and the "Sell" instrument`, () => {
    addTaskTab.addBuyAndSellInstruments();
});

Given(`user selects second instruments values:`, (dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        addTaskTab.setSecondInstruments(element.exchange, element.account, element.instrument);
    });
});

Given(`user types price values:`, (dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        addTaskTab.orderAmountInput.type(element.orderAmount);
        addTaskTab.maxPriceInput.clearAndType(element.maxPrice);
        addTaskTab.aggressionInput.type(element.aggression);
    });
});

Given(`user types premium values:`, (dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        addTaskTab.orderAmountInput.type(element.orderAmount);
        addTaskTab.maxPremiumInput.type(element.maxPremium);
        addTaskTab.aggressionInput.type(element.aggression);
    });
});

Given(`user click "Add Task" button`, () => {
    addTaskTab.addTaskFormButton.click();
});

Given(`user click "Reset Form" button`, () => {
    addTaskTab.resetFormButton.click();
});

Given(`user sees "Max Price" value in the "Max Price" input`, () => {
    addTaskTab.getMaxPriceValue();
    addTaskTab.checkContainMaxPriceValue();
});

Given(`user clears "Max Price" value and sees a "Reset price to current" Button`, () => {
    addTaskTab.maxPriceInput.clear();
    addTaskTab.resetPriceToCurrent.checkVisible();
    addTaskTab.addTaskFormButton.clickForce();
});

Given(`user clicks on the "Reset price to current" button in the "Add Task" form`, () => {
    addTaskTab.resetPriceToCurrent.click();
});
