import { blue, cyan, green, grey } from '@ant-design/colors';
import { InfoCircleOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';
import { assert } from '@common/utils/src/assert.ts';
import type { ColDef, ICellRendererParams, ValueGetterParams } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import {
    EHerodotusTerminalSelectors,
    HerodotusTerminalProps,
} from '@frontend/common/e2e/selectors/herodotus-terminal/herodotus-terminal.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Space } from '@frontend/common/src/components/Space';
import { Tag } from '@frontend/common/src/components/Tag';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { memo, useMemo } from 'react';

import type { THerodotusTaskView } from '../../../../types';
import { EHerodotusTaskStatus } from '../../../../types/domain';
import { cnClickable, cnStatus } from './TaskStatusRenderer.css';

export function getTaskStatusColumn(
    onStart: (id: THerodotusTaskView['taskId']) => void,
    onPaused: (id: THerodotusTaskView['taskId']) => void,
    onSave: (id: THerodotusTaskView['taskId']) => void,
    onReset: (id: THerodotusTaskView['taskId']) => void,
): ColDef<THerodotusTaskView> {
    return {
        colId: 'status',
        headerName: 'Status',
        equals: AgValue.isEqual,
        valueGetter: taskStatusValueGetter,
        cellRenderer: TaskStatusRenderer,
        cellRendererParams: {
            onStart,
            onPaused,
            onSave,
            onReset,
        },
        enableRowGroup: true,
        filter: EColumnFilterType.set,
        filterParams: {
            values: Object.values(EHerodotusTaskStatus),
        },
        filterValueGetter: (params) => params.data?.status.toLocaleUpperCase(),
        floatingFilter: true,
    };
}

const taskStatusValueGetter = ({ data }: ValueGetterParams<THerodotusTaskView>) => {
    return (
        data &&
        AgValue.create(data.status, data, ['taskId', 'statusMessage', 'hasDraft', 'updating'])
    );
};

type TStatusRendererParams = ICellRendererParams<ReturnType<typeof taskStatusValueGetter>> & {
    onStart?: (id: THerodotusTaskView['taskId']) => void;
    onPaused?: (id: THerodotusTaskView['taskId']) => void;
    onSave?: (id: THerodotusTaskView['taskId']) => void;
    onReset?: (id: THerodotusTaskView['taskId']) => void;
};

const mapStatusToColor = {
    [EHerodotusTaskStatus.started]: green[5],
    [EHerodotusTaskStatus.paused]: blue[5],
    [EHerodotusTaskStatus.finished]: cyan[5],
    [EHerodotusTaskStatus.archived]: grey[5],
    [EHerodotusTaskStatus.deleted]: grey[5],
};

const TaskStatusRenderer = memo((params: TStatusRendererParams): ReactElement | null => {
    const { value, onStart, onPaused, onSave, onReset } = params;
    const id = value?.data?.taskId;
    const status = value?.payload;
    const statusMessage = value?.data?.statusMessage;
    const hasDraft = Boolean(value?.data?.hasDraft);
    const updating = Boolean(value?.data?.updating);

    const cbClick = useFunction(() => {
        assert(!isNil(id), 'Task ID is not provided');

        if (status === EHerodotusTaskStatus.started) {
            return onPaused?.(id);
        }
        if (status === EHerodotusTaskStatus.paused) {
            return onStart?.(id);
        }
    });

    const cbSave = useFunction(() => {
        assert(!isNil(id), 'Task ID is not provided');
        onSave?.(id);
    });

    const cbReset = useFunction(() => {
        assert(!isNil(id), 'Task ID is not provided');
        onReset?.(id);
    });

    const title = useMemo(() => {
        assert(!isNil(id), 'Task ID is not provided');
        return status === EHerodotusTaskStatus.started
            ? 'Pause Task'
            : status === EHerodotusTaskStatus.paused
              ? 'Start Task'
              : undefined;
    }, [id, status]);

    if (isNil(status)) {
        return null;
    }

    const isClickable =
        !isNil(id) && [EHerodotusTaskStatus.paused, EHerodotusTaskStatus.started].includes(status);

    const statusMessageIcon = !isNil(statusMessage) ? (
        <Tooltip title={statusMessage}>
            <InfoCircleOutlined />
        </Tooltip>
    ) : null;

    return (
        <>
            {!hasDraft && (
                <Tag
                    title={title}
                    className={cn(cnStatus, { [cnClickable]: isClickable })}
                    color={mapStatusToColor[status]}
                    onClick={cbClick}
                >
                    {status}
                </Tag>
            )}
            {statusMessageIcon}
            {hasDraft && (
                <Space.Compact block size="large">
                    <Button
                        {...HerodotusTerminalProps[EHerodotusTerminalSelectors.SaveRoleButton]}
                        type="text"
                        title="Save task changes"
                        icon={<SaveOutlined />}
                        onClick={cbSave}
                        loading={updating}
                        disabled={updating}
                    />
                    {!updating && (
                        <Button
                            {...HerodotusTerminalProps[EHerodotusTerminalSelectors.ResetRoleButton]}
                            type="text"
                            title="Reset task changes"
                            icon={<UndoOutlined />}
                            onClick={cbReset}
                        />
                    )}
                </Space.Compact>
            )}
        </>
    );
});
