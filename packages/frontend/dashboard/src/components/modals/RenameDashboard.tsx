import { createTestProps } from '@frontend/common/e2e';
import { EDialogModalSelectors } from '@frontend/common/e2e/selectors/dialog.modal.selectors';
import { Alert } from '@frontend/common/src/components/Alert';
import { Form } from '@frontend/common/src/components/Form';
import { Input } from '@frontend/common/src/components/Input';
import { Modal } from '@frontend/common/src/components/Modals';
import { Space } from '@frontend/common/src/components/Space';
import type { TStorageDashboardName } from '@frontend/common/src/types/domain/dashboardsStorage';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';

export function RenameDashboard({
    currentName,
    occupiedNames,
    onSet,
    onCancel,
}: {
    currentName: TStorageDashboardName;
    occupiedNames: TStorageDashboardName[];
    onSet: (name: TStorageDashboardName) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(currentName);

    const obsoleteNamesSet = useMemo(
        () => new Set(occupiedNames.map((name) => name.trim())),
        [occupiedNames],
    );
    const isRestrictedName = useMemo(
        () => obsoleteNamesSet.has(name.trim()),
        [name, obsoleteNamesSet],
    );

    const cbSet = useFunction(() => name && onSet(name.trim() as TStorageDashboardName));
    const cbChange = useFunction((event: ChangeEvent<HTMLInputElement>) =>
        setName(event.target.value as TStorageDashboardName),
    );

    return (
        <Modal
            visible
            title={'Change Dashboard name'}
            okButtonProps={{
                disabled: isRestrictedName || name.trim().length === 0,
            }}
            onCancel={onCancel}
            onOk={cbSet}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <div>Set dashboard with name:</div>
                <Form onFinish={cbChange}>
                    <Input
                        autoFocus
                        value={name}
                        onChange={cbChange}
                        {...createTestProps(EDialogModalSelectors.NameInput)}
                    />
                </Form>

                {isRestrictedName && <Alert type="info" message="Dashboard name should be uniq" />}
            </Space>
        </Modal>
    );
}
