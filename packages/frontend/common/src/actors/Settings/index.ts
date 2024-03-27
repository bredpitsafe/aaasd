import { createActor } from '../../utils/Actors';
import { EActorName } from '../Root/defs';
import { deleteSettingsEnvBox, setSettingsEnvBox, settingsEnvBox } from './actions';
import { initDBSyncEffects } from './effect';
import { actionsBox } from './store';
import { getSettings, getSettingsDB$ } from './utils';

export function createActorSettings() {
    const database$ = getSettingsDB$();

    initDBSyncEffects(database$);

    return createActor(EActorName.Settings, (context) => {
        setSettingsEnvBox.as$(context).subscribe(({ payload }) => actionsBox.set(payload));

        deleteSettingsEnvBox.as$(context).subscribe(({ payload }) => actionsBox.set(payload));

        settingsEnvBox.responseStream(context, ({ storeName, key }) => {
            return getSettings(database$, storeName, key);
        });
    });
}
