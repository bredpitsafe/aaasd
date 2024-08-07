import { ECommonSettings } from '@frontend/common/src/components/Settings/def';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleApplicationName } from '@frontend/common/src/modules/applicationName';
import { ModuleSettings } from '@frontend/common/src/modules/settings';
import { ModuleNotifyErrorAndFail } from '@frontend/common/src/utils/Rx/ModuleNotify';
import { extractSyncedValueFromValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { combineLatest, EMPTY, fromEvent, switchMap } from 'rxjs';

import { ModuleFormDraft } from '../modules/formDraft';

export function initFormDraftEffects(ctx: TContextRef) {
    const { formDraftsCounter$ } = ModuleFormDraft(ctx);
    const { getAppSettings$ } = ModuleSettings(ctx);
    const { appName } = ModuleApplicationName(ctx);
    const notifyErrorAndFail = ModuleNotifyErrorAndFail(ctx);

    const beforeUnload$ = fromEvent(window, 'beforeunload');

    combineLatest([
        formDraftsCounter$,
        getAppSettings$(appName, ECommonSettings.ComponentsMetadataDraftUnsavedWarning).pipe(
            notifyErrorAndFail(),
            extractSyncedValueFromValueDescriptor(),
        ),
    ])
        .pipe(
            switchMap(([draftsCounter, shouldWarn]) =>
                draftsCounter && shouldWarn !== false ? beforeUnload$ : EMPTY,
            ),
        )
        .subscribe((event) => {
            event.preventDefault();
            event.returnValue = true;
        });
}
