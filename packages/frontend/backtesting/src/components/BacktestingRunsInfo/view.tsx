import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TBacktestingRun } from '@frontend/common/src/types/domain/backtestings';
import cn from 'classnames';

import { ScoreIndicatorsListInput } from '../common/ScoreIndicatorsListInput';
import type { TTableBacktestingRunsInfoProps } from '../TableBacktestingRunsInfo/view';
import { TableBacktestingRunsInfo } from '../TableBacktestingRunsInfo/view';
import { cnRoot, cnTable } from './view.css';

type TBacktestingRunsInfoProps = TWithClassname &
    TTableBacktestingRunsInfoProps & {
        scoreIndicatorsList: string[];
        setScoreIndicatorsList: (scoreIndicatorsList: string[]) => unknown;
        onUpdateScoreIndicatorsList: (scoreIndicatorsList: string[]) => unknown;
        activeBacktestingId: undefined | TBacktestingRun['btRunNo'];
        onChangeActiveBacktestingId: (backtestingRunId: number) => void;
    };

export function BacktestingRunsInfo(props: TBacktestingRunsInfoProps) {
    return (
        <div className={cn(cnRoot, props.className)}>
            <ScoreIndicatorsListInput
                scoreIndicatorsList={props.scoreIndicatorsList}
                setScoreIndicatorsList={props.setScoreIndicatorsList}
                onUpdateScoreIndicatorsList={props.onUpdateScoreIndicatorsList}
            />
            <TableBacktestingRunsInfo
                className={cnTable}
                variableNames={props.variableNames}
                scoreIndicatorsList={props.scoreIndicatorsList}
                runs={props.runs}
                timeZone={props.timeZone}
                activeBacktestingId={props.activeBacktestingId}
                onChangeActiveBacktestingId={props.onChangeActiveBacktestingId}
            />
        </div>
    );
}
