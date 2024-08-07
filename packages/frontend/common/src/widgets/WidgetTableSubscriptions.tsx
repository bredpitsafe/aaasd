import { lazily } from 'react-lazily';

import { cnTable } from '../components/AgTable/AgTable.css.ts';
import { EConfigEditorLanguages } from '../components/Editors/types.ts';
import { Modal } from '../components/Modals.ts';
import { useTimeZoneInfoSettings } from '../components/Settings/hooks/useTimeZoneSettings.ts';
import { Suspense } from '../components/Suspense.tsx';
import { useModule } from '../di/react.tsx';
import { ModuleModals } from '../lib/modals.tsx';
import { ModuleSubscriptionsState } from '../modules/subscriptionsState';
import { useFunction } from '../utils/React/useFunction.ts';
import { useSyncObservable } from '../utils/React/useSyncObservable.ts';
import { cnModal } from './ButtonSubscriptionsModal/WidgetButtonSubscriptionsModal.css.ts';

const { Editor } = lazily(() => import('../components/Editors/Editor'));
const { TableSubscriptions } = lazily(() => import('../components/Tables/TableSubscriptions/view'));

export type TWidgetTableSubscriptionsProps = {
    tableWithRouterSync?: boolean;
};
export const WidgetTableSubscriptions = (props: TWidgetTableSubscriptionsProps) => {
    const { subscriptionsState$ } = useModule(ModuleSubscriptionsState);

    const subscriptions = useSyncObservable(subscriptionsState$, []);
    const [{ timeZone }] = useTimeZoneInfoSettings();

    const { show } = useModule(ModuleModals);

    const cbShowModal = useFunction((content: string) => {
        const modal = show(
            <Modal
                open
                closable
                maskClosable
                className={cnModal}
                footer={null}
                destroyOnClose
                onCancel={() => modal.destroy()}
            >
                <Suspense component="Editor">
                    <Editor
                        language={EConfigEditorLanguages.json}
                        value={content}
                        className={cnTable}
                    />
                </Suspense>
            </Modal>,
        );
    });

    return (
        <Suspense component="Editor">
            <TableSubscriptions
                subscriptions={subscriptions}
                timeZone={timeZone}
                tableWithRouterSync={props.tableWithRouterSync ?? true}
                onOpenEditor={cbShowModal}
            />
        </Suspense>
    );
};
