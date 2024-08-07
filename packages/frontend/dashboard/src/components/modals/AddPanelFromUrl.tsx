import { Form } from '@frontend/common/src/components/Form';
import { Modal } from '@frontend/common/src/components/Modals';
import { Select } from '@frontend/common/src/components/Select';
import { Space } from '@frontend/common/src/components/Space';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import type { TDashboardItem, TDashboardItemKey } from '../../types/fullDashboard';
import {
    getDashboardItemKeyFromItem,
    getUniqueDashboardItemKey,
    sortDashboardItems,
} from '../../utils/dashboards';

export function AddPanelFromUrl({
    defaultDashboardItemKey,
    dashboardItems,
    onAdd,
    onCancel,
}: {
    defaultDashboardItemKey?: TDashboardItemKey;
    dashboardItems: TDashboardItem[];
    onAdd: (dashboardItemKey: TDashboardItemKey) => void;
    onCancel: () => void;
}) {
    const sortedItems = useMemo(() => sortDashboardItems(dashboardItems), [dashboardItems]);

    useEffect(() => {
        if (sortedItems.length === 0) {
            onCancel();
        }
        if (sortedItems.length === 1) {
            onAdd(getDashboardItemKeyFromItem(sortedItems[0]));
        }
    }, [sortedItems, onCancel, onAdd]);

    const items = useMemo(
        () =>
            sortedItems.map((item) => ({
                name: item.name,
                key: getUniqueDashboardItemKey(getDashboardItemKeyFromItem(item)),
            })),
        [sortedItems],
    );

    const currentUniqKey = useMemo(() => {
        if (items.length === 0) {
            return undefined;
        }

        const defaultNormalized = isNil(defaultDashboardItemKey)
            ? undefined
            : items.find(({ key }) => key === getUniqueDashboardItemKey(defaultDashboardItemKey));

        if (!isNil(defaultNormalized)) {
            return defaultNormalized.key;
        }

        return items[0].key;
    }, [items, defaultDashboardItemKey]);

    const [dashboardUniqKey, setDashboardItemKey] = useState<string | undefined>(currentUniqKey);

    const cbAdd = useFunction(() => {
        if (isNil(dashboardUniqKey)) {
            onCancel();
            return;
        }

        const dashboardItemKey = sortedItems
            .map((dashboard) => getDashboardItemKeyFromItem(dashboard))
            .find(
                (dashboardItemKey) =>
                    getUniqueDashboardItemKey(dashboardItemKey) === dashboardUniqKey,
            );

        if (isNil(dashboardItemKey)) {
            onCancel();
        } else {
            onAdd(dashboardItemKey);
        }
    });

    const displayItems = useMemo(
        () => items.map(({ key, name }) => ({ label: name, value: key })),
        [items],
    );

    return (
        <Modal
            title={'Add panel'}
            open
            okText={'Add'}
            okButtonProps={{
                disabled: isNil(dashboardUniqKey),
            }}
            onOk={cbAdd}
            onCancel={onCancel}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <div>Add panel to dashboard</div>
                <Form onFinish={cbAdd}>
                    <Select
                        autoFocus
                        showSearch
                        allowClear
                        optionFilterProp="label"
                        style={{ width: '100%' }}
                        value={dashboardUniqKey}
                        onChange={setDashboardItemKey}
                        options={displayItems}
                    />
                </Form>
            </Space>
        </Modal>
    );
}
