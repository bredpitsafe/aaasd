import { ModuleFactory, TContextRef } from '@frontend/common/src/di';
import { ModuleModals } from '@frontend/common/src/lib/modals';

import { WidgetModalSettings } from '../../../widgets/WidgetModalSettings';

export const ModuleOpenModalSettings = ModuleFactory((ctx: TContextRef) => {
    const { show } = ModuleModals(ctx);

    return () => {
        const modal = show(<WidgetModalSettings onClose={destroyModal} />);

        function destroyModal() {
            modal.destroy();
        }
    };
});
