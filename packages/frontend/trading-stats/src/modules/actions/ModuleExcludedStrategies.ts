import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleApplicationName } from '@frontend/common/src/modules/applicationName/index.ts';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import type { TStrategyName } from '@frontend/common/src/types/domain/ownTrades.ts';
import type { TSocketStruct, TSocketURL } from '@frontend/common/src/types/domain/sockets.ts';
import { dedobs } from '@frontend/common/src/utils/observable/memo.ts';
import { ModuleNotifyErrorAndFail } from '@frontend/common/src/utils/Rx/ModuleNotify.ts';
import { extractSyncedValueFromValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { extractSocketUrl } from '@frontend/common/src/utils/url.ts';

import { ETradingStatsSettings } from '../../components/Settings/def.ts';

export const ModuleExcludedStrategies = ModuleFactory((ctx) => {
    const { getAppSettings$, setAppSettings } = ModuleSettings(ctx);

    const { appName } = ModuleApplicationName(ctx);

    const notifyErrorAndFail = ModuleNotifyErrorAndFail(ctx);

    const subscribeToExcludedStrategies = dedobs((target: TSocketURL | TSocketStruct) => {
        return getAppSettings$(appName, getSettingKey(target)).pipe(
            notifyErrorAndFail(),
            extractSyncedValueFromValueDescriptor(),
        );
    }, {});

    const setExcludedStrategies = (target: TSocketURL | TSocketStruct, value: TStrategyName[]) =>
        setAppSettings({ appName, key: getSettingKey(target), value });

    return { subscribeToExcludedStrategies, setExcludedStrategies };
});

const getSettingKey = (target: TSocketURL | TSocketStruct): string =>
    `${ETradingStatsSettings.ExcludedStrategies}_${extractSocketUrl(target)}`;
