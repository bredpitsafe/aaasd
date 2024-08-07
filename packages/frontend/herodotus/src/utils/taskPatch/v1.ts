import { assert } from '@common/utils/src/assert.ts';
import { isNil, isNumber } from 'lodash-es';

import type { THerodotusTaskView } from '../../types';
import type { THerodotusTaskInstrument } from '../../types/domain';
import { EAmountType } from '../../types/domain';
import type {
    THerodotusTaskInstrumentPatchV1,
    THerodotusTaskPatchV1,
} from '../../types/v1/taskPatch';
import { isV2HeroProtocolInstrument, isV2HeroProtocolTaskView } from '../isV2HeroProtocol';

export const createHerodotusTaskPatchV1 = (task: THerodotusTaskView): THerodotusTaskPatchV1 => {
    assert(!isV2HeroProtocolTaskView(task), 'Incorrect task passed to createHerodotusTaskPatchV1');
    return {
        aggression: task.aggression,
        amount: {
            [isV2HeroProtocolTaskView(task) || isNumber(task.amount) || isNil(task.amount?.Usd)
                ? EAmountType.Base
                : EAmountType.Usd]: task.amountView ?? undefined,
        },
        orderSize: task.orderSize,
        priceLimit: task.priceLimitView,
        maxPremium: task.maxPremium,
        taskId: task.taskId,
        buyInstruments: task.buyInstruments?.map(createHerodotusInstrumentPatchV1),
        sellInstruments: task.sellInstruments?.map(createHerodotusInstrumentPatchV1),
    };
};

const createHerodotusInstrumentPatchV1 = (
    inst: THerodotusTaskInstrument,
): THerodotusTaskInstrumentPatchV1 => {
    assert(
        !isV2HeroProtocolInstrument(inst),
        'Incorrect instrument passed to createHerodotusInstrumentPatchV1',
    );

    return {
        class: inst.class,
        role: inst.role,
        name: inst.name,
        account: inst.account,
        exchange: inst.exchange,
        aggressionOverride: inst.aggressionOverride,
    };
};
