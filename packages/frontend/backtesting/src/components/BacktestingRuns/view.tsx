import type { TWithClassname } from '@frontend/common/src/types/components';
import cn from 'classnames';

import { ScoreIndicatorsListInput } from '../common/ScoreIndicatorsListInput';
import type { TTableBacktestingRunsProps } from '../TableBacktestingRuns/view';
import { TableBacktestingRuns } from '../TableBacktestingRuns/view';
import { cnRoot, cnTable } from './view.css';

type TBacktestingRunsProps = TWithClassname &
    TTableBacktestingRunsProps & {
        scoreIndicatorsList: string[];
        setScoreIndicatorsList: (scoreIndicatorsList: string[]) => unknown;
        onUpdateScoreIndicatorsList: (scoreIndicatorsList: string[]) => unknown;
    };

export function BacktestingRuns(props: TBacktestingRunsProps) {
    return (
        <div className={cn(cnRoot, props.className)}>
            <ScoreIndicatorsListInput
                scoreIndicatorsList={props.scoreIndicatorsList}
                setScoreIndicatorsList={props.setScoreIndicatorsList}
                onUpdateScoreIndicatorsList={props.onUpdateScoreIndicatorsList}
            />
            <TableBacktestingRuns
                className={cnTable}
                items={props.items}
                scoreIndicatorsList={props.scoreIndicatorsList}
                activeBacktestingId={props.activeBacktestingId}
                onChangeActiveBacktestingId={props.onChangeActiveBacktestingId}
                onPause={props.onPause}
                onResume={props.onResume}
                timeZone={props.timeZone}
            />
        </div>
    );
}
