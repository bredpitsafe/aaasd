import { assert } from '@common/utils/src/assert.ts';
import type { CellEditRequestEvent, GridOptions } from '@frontend/ag-grid';
import { ESide } from '@frontend/common/src/types/domain/task';
import { delay } from '@frontend/common/src/utils/delay';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil, set } from 'lodash-es';
import { useState } from 'react';

import type { THerodotusTaskInstrumentView, THerodotusTaskView } from '../types';
import type { THerodotusTaskId } from '../types/domain';
import { useMaxPremiumConfirmation } from './useMaxPremiumConfirmation';

type TUseDraftedTasksReturnType = {
    tasks: THerodotusTaskView[] | undefined;
    onSave: (taskId: THerodotusTaskId) => Promise<unknown>;
    onReset: () => void;
    onRequestTaskEdit: GridOptions<THerodotusTaskView>['onCellEditRequest'];
    onRequestInstrumentEdit: GridOptions<THerodotusTaskInstrumentView>['onCellEditRequest'];
};

// If the edited field ID is found in the following lists after applying the changes,
// then the changes should NOT be applied automatically
// User will be forced to press `Save` button in the UI to save such changes.
const DEFERRED_INSTRUMENT_KEYS: (keyof THerodotusTaskInstrumentView)[] = ['role'];

const RESET_TASK_DRAFT_DELAY = 2_000;

export const useDraftedTasks = (
    tasks: THerodotusTaskView[] | undefined,
    onSave: (task: THerodotusTaskView) => Promise<unknown>,
): TUseDraftedTasksReturnType => {
    const [draftedTask, setDraftedTask] = useState<THerodotusTaskView | undefined>(undefined);
    const cbEditTaskDraft = useFunction((task: THerodotusTaskView) => {
        setDraftedTask({ ...task, hasDraft: true });
    });
    const cbConfirmMaxPremium = useMaxPremiumConfirmation();

    const cbSaveTask = useFunction(
        async (taskId: THerodotusTaskId, task: THerodotusTaskView | undefined = draftedTask) => {
            assert(!isNil(task), 'Drafted task is empty');
            assert(task.taskId === taskId, 'Trying to save non-drafted task');
            assert(task.updating !== true, 'Drafted task is already in updating state');
            try {
                setDraftedTask({ ...task, hasDraft: true, updating: true });
                await onSave(task);
                // Wait for a few seconds before resetting drafted task to avoid flashing
                // between draft reset & actually receiving a subscription update
                setDraftedTask({ ...task, hasDraft: false, updating: false });
                await delay(RESET_TASK_DRAFT_DELAY);
                setDraftedTask(undefined);
            } catch (e) {
                setDraftedTask({ ...task, hasDraft: true, updating: false });
                throw e;
            }
        },
    );

    const cbRequestTaskEdit: GridOptions<THerodotusTaskView>['onCellEditRequest'] = useFunction(
        async (event: CellEditRequestEvent<THerodotusTaskView>) => {
            const fieldId = event.colDef.field as keyof THerodotusTaskView;

            assert(
                !isNil(fieldId),
                'Failed to determine editable column id. Most probably, column definition is missing `field` property',
            );

            if (fieldId === 'maxPremium') {
                if (!(await cbConfirmMaxPremium(event.newValue))) {
                    return;
                }
            }

            const newTask: THerodotusTaskView = set(
                {
                    ...event.data,
                },
                fieldId,
                event.newValue,
            );
            return cbSaveTask(newTask.taskId, newTask);
        },
    );

    const cbRequestInstrumentEdit: GridOptions<THerodotusTaskInstrumentView>['onCellEditRequest'] =
        useFunction((event: CellEditRequestEvent<THerodotusTaskInstrumentView>) => {
            const fieldId = event.colDef.field as keyof THerodotusTaskInstrumentView;
            assert(
                !isNil(fieldId),
                'Failed to determine editable column id. Most probably, column definition is missing `field` property',
            );

            // Create new instrument with edited field
            const instrument = set(
                {
                    ...event.data,
                },
                fieldId,
                event.newValue,
            ) as THerodotusTaskInstrumentView;

            // Find task
            const task = tasksWithDraft?.find((task) => task.taskId === event.data.taskId);
            assert(!isNil(task), 'Editable task not found');

            let newTask = task;
            // Find and replace task instrument
            if (instrument.side === ESide.Buy) {
                newTask = {
                    ...task,
                    buyInstruments:
                        task.buyInstruments?.map((inst) => {
                            if (inst.key !== instrument.key) {
                                return inst;
                            }
                            return instrument;
                        }) ?? null,
                };
            }
            if (instrument.side === ESide.Sell) {
                newTask = {
                    ...task,
                    sellInstruments:
                        task.sellInstruments?.map((inst) => {
                            if (inst.key !== instrument.key) {
                                return inst;
                            }
                            return instrument;
                        }) ?? null,
                };
            }

            if (DEFERRED_INSTRUMENT_KEYS.includes(fieldId)) {
                return cbEditTaskDraft(newTask);
            }
            return cbSaveTask(newTask.taskId, newTask);
        });

    const cbReset = useFunction(() => {
        setDraftedTask(undefined);
    });

    const tasksWithDraft = tasks?.map((task) =>
        !isNil(draftedTask) && task.taskId === draftedTask.taskId ? draftedTask : task,
    );

    return {
        tasks: tasksWithDraft,
        onSave: cbSaveTask,
        onReset: cbReset,
        onRequestTaskEdit: cbRequestTaskEdit,
        onRequestInstrumentEdit: cbRequestInstrumentEdit,
    };
};
