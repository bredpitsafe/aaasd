import { createTestProps } from '@frontend/common/e2e';
import { EDialogModalSelectors } from '@frontend/common/e2e/selectors/dialog.modal.selectors';
import { Alert } from '@frontend/common/src/components/Alert';
import { Button } from '@frontend/common/src/components/Button';
import { Form } from '@frontend/common/src/components/Form';
import { Input } from '@frontend/common/src/components/Input';
import { Modal } from '@frontend/common/src/components/Modals';
import { Space } from '@frontend/common/src/components/Space';
import type { TStorageDashboardName } from '@frontend/common/src/types/domain/dashboardsStorage';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isEmpty, isNil } from 'lodash-es';
import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';

import type { TDashboardItem, TDashboardItemKey } from '../../types/fullDashboard';
import { isStorageDashboardItem } from '../../types/fullDashboard/guards';
import { EOpenType } from '../../types/router';
import {
    getDashboardItemKeyFromItem,
    isReadonlyDashboardsStorageItem,
    sortDashboardItems,
} from '../../utils/dashboards';

export function SelectDashboardNameDialog({
    title,
    name,
    dashboardItems,
    allowToChooseNewTab = true,
    allowExistingDashboard = true,
    onSet,
    onCancel,
}: {
    title: string;
    name: TStorageDashboardName;
    dashboardItems: TDashboardItem[];
    allowToChooseNewTab?: boolean;
    allowExistingDashboard?: boolean;
    onSet: (
        itemKey: undefined | TDashboardItemKey,
        name: TStorageDashboardName,
        openType: EOpenType,
    ) => void;
    onCancel: () => void;
}) {
    const sortedItems = useMemo(() => sortDashboardItems(dashboardItems), [dashboardItems]);

    const [newName, setName] = useState(name);

    const trimmedName = useMemo(() => newName.trim() as TStorageDashboardName, [newName]);
    const matchDashboardItem = useMemo(
        () => sortedItems.find(({ name }) => name === trimmedName),
        [sortedItems, trimmedName],
    );
    const isBlocked = useMemo(
        () =>
            !isNil(matchDashboardItem) &&
            (!isStorageDashboardItem(matchDashboardItem) ||
                isReadonlyDashboardsStorageItem(matchDashboardItem.item)),
        [matchDashboardItem],
    );

    const cbSet = useFunction((openType: EOpenType) => {
        if (isNil(trimmedName)) {
            return;
        }

        onSet(
            isNil(matchDashboardItem) ? undefined : getDashboardItemKeyFromItem(matchDashboardItem),
            trimmedName,
            openType,
        );
    });
    const cbSetCurrent = useFunction(() => cbSet(EOpenType.CurrentWindow));
    const cbSetNew = useFunction(() => cbSet(EOpenType.NewWindow));
    const cbChange = useFunction((event: ChangeEvent<HTMLInputElement>) =>
        setName(event.target.value as TStorageDashboardName),
    );

    const canSubmit =
        !isEmpty(trimmedName) &&
        !isBlocked &&
        (allowExistingDashboard || isNil(matchDashboardItem));

    return (
        <Modal
            title={title}
            open
            okButtonProps={{ disabled: isEmpty(trimmedName) }}
            onCancel={onCancel}
            footer={
                <>
                    <Button
                        {...createTestProps(EDialogModalSelectors.CancelButton)}
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        {...createTestProps(EDialogModalSelectors.ThisWindowButton)}
                        type="primary"
                        disabled={!canSubmit}
                        onClick={cbSetCurrent}
                    >
                        This Window
                    </Button>
                    {allowToChooseNewTab && (
                        <Button disabled={!canSubmit} type="primary" onClick={cbSetNew}>
                            New Window
                        </Button>
                    )}
                </>
            }
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <div>Set dashboard with name:</div>
                <Form onFinish={cbSetCurrent}>
                    <Input
                        autoFocus
                        value={newName}
                        onChange={cbChange}
                        {...createTestProps(EDialogModalSelectors.NameInput)}
                    />
                </Form>

                {isBlocked && (
                    <Alert
                        type="warning"
                        message="Dashboard is readonly and you can't rewrite it"
                    />
                )}

                {!isBlocked && !isNil(matchDashboardItem) && (
                    <Alert
                        type="info"
                        message={`Dashboard with this name exists${
                            allowExistingDashboard ? ' , dashboard will be replaced' : ''
                        }`}
                    />
                )}
            </Space>
        </Modal>
    );
}
