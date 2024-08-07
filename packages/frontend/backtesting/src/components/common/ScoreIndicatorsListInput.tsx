import { SaveOutlined } from '@ant-design/icons';
import {
    BacktestingProps,
    EBacktestingSelectors,
} from '@frontend/common/e2e/selectors/backtesting/backtesting.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Select } from '@frontend/common/src/components/Select';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { useAggregate } from '@frontend/common/src/utils/React/useAggregate';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { uniq } from 'lodash-es';
import { memo, useMemo } from 'react';

import { cnIndicatorsContainer, cnIndicatorsInput, cnSaveAction } from './view.css';

export const ScoreIndicatorsListInput = memo(
    ({
        scoreIndicatorsList,
        setScoreIndicatorsList,
        onUpdateScoreIndicatorsList,
    }: {
        scoreIndicatorsList: string[];
        setScoreIndicatorsList: (v: string[]) => unknown;
        onUpdateScoreIndicatorsList: (scoreIndicator: string[]) => unknown | Promise<unknown>;
    }) => {
        const handleChange = useFunction((indicatorsList) =>
            setScoreIndicatorsList(indicatorsList),
        );

        const handleScoreIndicatorSave = useFunction(() =>
            onUpdateScoreIndicatorsList(scoreIndicatorsList),
        );

        const fullScoreIndicatorsList = useAggregate(
            scoreIndicatorsList,
            (previous, next) => uniq([...previous, ...next]),
            EMPTY_ARRAY as string[],
        );
        const options = useMemo(
            () =>
                fullScoreIndicatorsList.map((indicatorName) => ({
                    label: indicatorName,
                    value: indicatorName,
                })),
            [fullScoreIndicatorsList],
        );

        return (
            <div className={cnIndicatorsContainer}>
                <Select
                    {...BacktestingProps[EBacktestingSelectors.ScoreIndicatorInput]}
                    className={cnIndicatorsInput}
                    placeholder="Score indicator names"
                    value={scoreIndicatorsList}
                    onChange={handleChange}
                    mode="tags"
                    options={options}
                />
                <Button
                    {...BacktestingProps[EBacktestingSelectors.SaveScoreIndicatorButton]}
                    className={cnSaveAction}
                    type="text"
                    icon={<SaveOutlined />}
                    onClick={handleScoreIndicatorSave}
                />
            </div>
        );
    },
);
