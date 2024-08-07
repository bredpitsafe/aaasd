import { EditOutlined, HistoryOutlined } from '@ant-design/icons';
import {
    DashboardPageProps,
    EDashboardPageSelectors,
} from '@frontend/common/e2e/selectors/dashboard/dashboard.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Input } from '@frontend/common/src/components/Input';
import { useModule } from '@frontend/common/src/di/react';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { purple } from '@frontend/common/src/utils/colors';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import cn from 'classnames';
import { isNaN, isNull, isObject, isUndefined } from 'lodash-es';
import { memo, useState } from 'react';

import { ModuleDashboardRouter } from '../../modules/router/module';
import { cnCompact, cnFloatingWideBox, cnInputBox, cnWideBox } from './styles.css';

type TProps = TWithClassname & {
    type: 'full' | 'compact';
};

export const BTRunSelector = memo((props: TProps) => {
    const BTRunId = useCurrentBTRunId();
    const [isHover, setIsHover] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const setAsFocused = useFunction(() => setIsFocused(true));
    const setAsNotFocused = useFunction(() => setIsFocused(false));
    const setAsHovered = useFunction(() => setIsHover(true));
    const setAsNotHovered = useFunction(() => setIsHover(false));
    const isActive = isHover || isFocused;

    if (isNull(BTRunId) && !isFocused) {
        return (
            <Button
                {...DashboardPageProps[EDashboardPageSelectors.SetBacktestingInput]}
                icon={<HistoryOutlined />}
                title="Set Backtesting"
                onClick={setAsFocused}
            >
                {props.type === 'full' && 'Set Backtesting'}
            </Button>
        );
    }

    if (props.type === 'full')
        return (
            <BTRunFullSelector
                className={props.className}
                onBlur={setAsNotFocused}
                onFocus={setAsFocused}
            />
        );

    return (
        <div
            className={cn(props.className, cnCompact)}
            onMouseEnter={setAsHovered}
            onMouseLeave={setAsNotHovered}
        >
            BTRun
            <br />
            {BTRunId ?? '0'}
            {isActive ? (
                <BTRunFullSelector
                    className={cnFloatingWideBox}
                    onBlur={setAsNotFocused}
                    onFocus={setAsFocused}
                />
            ) : null}
        </div>
    );
});

type TFullIndicatorProps = TWithClassname & {
    onFocus: () => void;
    onBlur: () => void;
};

const BTRunFullSelector = memo((props: TFullIndicatorProps) => {
    const { setParams } = useModule(ModuleDashboardRouter);
    const BTRunId = useCurrentBTRunId();
    const [isEditMode, setIsEditMode] = useState(false);
    const [value, setValue] = useState<string | null>(null);
    const submit = useFunction(() => {
        if (!isNull(value)) {
            if (value.trim() === '') {
                setParams({ backtestingId: undefined });
            }
            const numValue = parseInt(value);
            if (!isNaN(numValue)) {
                setParams({ backtestingId: numValue });
            }
        }
        setValue(null);
        setIsEditMode(false);
        props.onBlur();
    });
    const setNewValue = useFunction((e: { target: { value: string } }) => {
        setValue(e.target.value);
    });
    const blur = useFunction((e: { currentTarget: { blur: () => void } }) => {
        e.currentTarget.blur();
    });

    return (
        <div className={cn(props.className, cnWideBox)} onClick={() => setIsEditMode(true)}>
            <span>BTRun {BTRunId}</span>
            {(isEditMode || isNull(BTRunId)) && (
                <div className={cnInputBox}>
                    <Input
                        value={isNull(value) ? BTRunId ?? '' : value}
                        onFocus={props.onFocus}
                        autoFocus
                        onBlur={submit}
                        onChange={setNewValue}
                        size="small"
                        onPressEnter={blur}
                        allowClear
                    />
                </div>
            )}
            <EditOutlined color={purple[6]} />
        </div>
    );
});

function useCurrentBTRunId(): number | undefined | null {
    const { state$ } = useModule(ModuleDashboardRouter);
    const state = useSyncObservable(state$);
    if (isUndefined(state)) return undefined;
    const params = state?.route.params;
    if (isObject(params) && 'backtestingId' in params) {
        return params.backtestingId ?? null;
    }

    return null;
}
