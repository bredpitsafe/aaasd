import { TableOutlined } from '@ant-design/icons';
import { lazily } from 'react-lazily';

const { WidgetTableSubscriptions } = lazily(() => import('../WidgetTableSubscriptions.tsx'));

import { useMemo } from 'react';
import { map } from 'rxjs';

import { Button } from '../../components/Button.tsx';
import { Col, Row } from '../../components/Grid.tsx';
import { Modal } from '../../components/Modals.ts';
import { cnButtonPosition } from '../../components/Settings/components/view.css.ts';
import { Suspense } from '../../components/Suspense.tsx';
import { useModule } from '../../di/react.tsx';
import { ModuleModals } from '../../lib/modals.tsx';
import { ModuleSubscriptionsState } from '../../modules/subscriptionsState';
import { useFunction } from '../../utils/React/useFunction.ts';
import { useSyncObservable } from '../../utils/React/useSyncObservable.ts';
import type { TWidgetTableSubscriptionsProps } from '../WidgetTableSubscriptions.tsx';
import { cnModal } from './WidgetButtonSubscriptionsModal.css.ts';

type TButtonSubscriptionsModalProps = TWidgetTableSubscriptionsProps;
export const WidgetButtonSubscriptionsModal = (props: TButtonSubscriptionsModalProps) => {
    const { show } = useModule(ModuleModals);
    const { subscriptionsState$ } = useModule(ModuleSubscriptionsState);
    const count$ = useMemo(
        () => subscriptionsState$.pipe(map((state) => state.length)),
        [subscriptionsState$],
    );

    const count = useSyncObservable(count$);

    const cbShowModal = useFunction(() => {
        const modal = show(
            <Modal
                title={null}
                open
                closable
                maskClosable
                className={cnModal}
                footer={null}
                destroyOnClose
                onCancel={() => modal.destroy()}
            >
                <Suspense component="Subscriptions">
                    <WidgetTableSubscriptions {...props} />
                </Suspense>
            </Modal>,
        );
    });

    return (
        <Row gutter={[8, 16]}>
            <Col flex="auto" className={cnButtonPosition}>
                <Button icon={<TableOutlined />} onClick={cbShowModal}>
                    Subscriptions ({count})
                </Button>
            </Col>
        </Row>
    );
};
