import {
    ConnectedModalSettings,
    TConnectedModalSettingsProps,
} from '../../components/Settings/ConnectedModalSettings';
import { TContextRef } from '../../di';
import { ModuleModals } from '../../lib/modals';

export function openModalSettings(
    context: TContextRef,
    props: TConnectedModalSettingsProps,
): () => void {
    const { show } = ModuleModals(context);

    const modal = show(
        <ConnectedModalSettings onClose={destroyModal} onChangeSocket={destroyModal} {...props} />,
    );

    function destroyModal() {
        modal.destroy();
    }

    return destroyModal;
}
