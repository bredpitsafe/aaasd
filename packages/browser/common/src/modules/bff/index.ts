import { commonSettingsStoreName } from '../../actors/Settings/db.ts';
import { ECommonSettings } from '../../components/Settings/def.ts';
import { ModuleFactory } from '../../di';
import { TSocketName } from '../../types/domain/sockets.ts';
import { ModuleSettings } from '../settings';
import { bffSocketsList$, getCurrentBffSocket$ } from './data';

export const ModuleBFF = ModuleFactory((ctx) => {
    const { getAppSettings$ } = ModuleSettings(ctx);
    const currentBffSocket$ = getAppSettings$<TSocketName>(
        commonSettingsStoreName,
        ECommonSettings.BFFServiceStage,
    );

    return {
        bffSocketsList$,
        getCurrentBFFSocket$: getCurrentBffSocket$.bind(null, currentBffSocket$),
    };
});
