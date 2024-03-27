import { SaveOutlined } from '@ant-design/icons';
import {
    ERunsTabSelectors,
    RunsTabProps,
} from '@frontend/common/e2e/selectors/backtesting/components/runs-tab/runs.tab.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Select } from '@frontend/common/src/components/Select';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { memo } from 'react';

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

        return (
            <div className={cnIndicatorsContainer}>
                <Select
                    {...RunsTabProps[ERunsTabSelectors.ScoreIndicatorSearchInput]}
                    className={cnIndicatorsInput}
                    placeholder="Score indicator names"
                    value={scoreIndicatorsList}
                    onChange={handleChange}
                    mode="tags"
                />
                <Button
                    {...RunsTabProps[ERunsTabSelectors.SaveScoreIndicatorButton]}
                    className={cnSaveAction}
                    type="text"
                    icon={<SaveOutlined />}
                    onClick={handleScoreIndicatorSave}
                />
            </div>
        );
    },
);
