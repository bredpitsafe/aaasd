import { assert } from '@common/utils/src/assert.ts';
import { isNumber } from 'lodash-es';

import type { THerodotusTaskView } from '../../types';
import type { THerodotusTaskInstrument } from '../../types/domain';
import type {
    THerodotusTaskInstrumentPatchV2,
    THerodotusTaskPatchV2,
} from '../../types/v2/taskPatch';
import { isV2HeroProtocolInstrument, isV2HeroProtocolTaskView } from '../isV2HeroProtocol';

export const createHerodotusTaskPatchV2 = (task: THerodotusTaskView): THerodotusTaskPatchV2 => {
    assert(isV2HeroProtocolTaskView(task), 'Incorrect task passed to createHerodotusTaskPatchV2');
    assert(
        isNumber(task.amountView),
        'Incorrect task.amountView passed to createHerodotusTaskPatchV2, must be number',
    );

    return {
        aggression: task.aggression,
        amount: task.amountView,
        orderSize: task.orderSize,
        priceLimit: task.priceLimitView,
        maxPremium: task.maxPremium,
        taskId: task.taskId,
        buyInstruments: task.buyInstruments?.map(createHerodotusTaskInstrumentPatchV2),
        sellInstruments: task.sellInstruments?.map(createHerodotusTaskInstrumentPatchV2),
    };
};

const createHerodotusTaskInstrumentPatchV2 = (
    inst: THerodotusTaskInstrument,
): THerodotusTaskInstrumentPatchV2 => {
    assert(
        isV2HeroProtocolInstrument(inst),
        'Incorrect instruments passed to createHerodotusTaskInstrumentPatchV2',
    );

    return {
        class: inst.class,
        instrumentId: inst.instrumentId,
        role: inst.role,
        virtualAccountId: inst.virtualAccount,
        aggressionOverride: inst.aggressionOverride,
    };
};
