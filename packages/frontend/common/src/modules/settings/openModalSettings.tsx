import type { TConnectedModalSettingsProps } from '../../components/Settings/ConnectedModalSettings';
import { ConnectedModalSettings } from '../../components/Settings/ConnectedModalSettings';
import type { TContextRef } from '../../di';
import { ModuleModals } from '../../lib/modals';

export function openModalSettings(
    context: TContextRef,
    props: TConnectedModalSettingsProps,
): () => void {
    const { show } = ModuleModals(context);

    const modal = show(<ConnectedModalSettings onClose={destroyModal} {...props} />);

    function destroyModal() {
        modal.destroy();
    }

    return destroyModal;
}
