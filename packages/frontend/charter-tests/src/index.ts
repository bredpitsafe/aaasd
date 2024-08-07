import '@frontend/common/src/utils/Rx/internalProviders';

import type { TSeriesId } from '@frontend/charter/lib/Parts/def';
import { injectToDataset } from '@frontend/common/e2e';
import { ECharterTestSelectors } from '@frontend/common/e2e/selectors/charter-test/charter-test.page.selectors';
import { getLeft, getRight, isLeft, isRight } from '@frontend/common/src/types/Either';
import { getRandomUint32 } from '@frontend/common/src/utils/random';
import { tryDo } from '@frontend/common/src/utils/tryDo';

import { TestCaseSelector } from './testCaseSelector';
import { casesMap } from './testChartsData';
import { generateChart, getRenderCountDelay, getTestName, notExistName } from './utils';

(function app() {
    const root = document.getElementById('root')!;

    if (notExistName()) {
        root.appendChild(TestCaseSelector());
        return;
    }

    const testName = tryDo(getTestName);

    if (isLeft(testName)) {
        root.appendChild(document.createTextNode(getLeft(testName).message));
        return;
    }

    if (isRight(testName)) {
        const { charts, configure } = casesMap[getRight(testName)];

        charts.forEach((chart) => {
            chart.id = `${chart.id}|${getRandomUint32()}` as TSeriesId;
        });

        generateChart(root, charts).then((charter) => {
            configure?.(charter);

            getRenderCountDelay(charter.getSharedCanvas() as HTMLCanvasElement).then(
                () => injectToDataset(root, ECharterTestSelectors.Charter),
                (error: Error) => root.appendChild(document.createTextNode(error.message)),
            );
        });
    }
})();
