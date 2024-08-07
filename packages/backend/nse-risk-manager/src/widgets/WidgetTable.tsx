import { UndoOutlined } from '@ant-design/icons';
import { Button } from '@frontend/common/src/components/Button';
import { assert } from '@frontend/common/src/utils/assert';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import { useEffect, useState } from 'react';
import * as React from 'react';

import { getFormData } from '../actions/getFormData';
import { setFormData } from '../actions/setFormData';
import { Groups } from '../components/Groups/Groups';
import { PageLayout } from '../components/PageLayout/PageLayout';
import type { TRiskSettings, TRiskSettingsGroup } from '../def';
import { getServerActionResponse } from '../lib/actions/getServerActionResponse';
import { error as notificationError, success as notificationSuccess } from '../lib/notifications';

export const WidgetTable = () => {
    const [data, setData] = useState<TRiskSettings | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const cbLoadData = useFunction(async () => {
        try {
            setError(undefined);
            setData(undefined);
            setLoading(true);
            const data = await getServerActionResponse(getFormData());
            setData(data);
            setHasChanges(false);
        } catch (err) {
            setData(undefined);
            setError((err as Error).message);
            notificationError({ message: (err as Error).message });
        } finally {
            setLoading(false);
        }
    });

    const cbSubmit = useFunction(async () => {
        const submittedData = data;
        try {
            setLoading(true);
            assert(!isNil(submittedData), 'There`s no data to submit');
            await getServerActionResponse(setFormData(submittedData));
            notificationSuccess({ message: 'Values have been applied successfully' });
            await cbLoadData();
        } catch (err) {
            notificationError({ message: (err as Error).message });
            setData(submittedData);
        } finally {
            setLoading(false);
        }
    });

    const cbEditField = useFunction(
        (
            groupIndex: number,
            field: keyof TRiskSettingsGroup,
            value: TRiskSettingsGroup[keyof TRiskSettingsGroup],
        ) => {
            assert(!isNil(data), 'form data is not defined');
            setData({
                ...data,
                group: data.group?.map((item, index) => {
                    if (index !== groupIndex) {
                        return item;
                    }
                    return {
                        ...item,
                        [field]: value,
                    };
                }),
            });
            setHasChanges(true);
        },
    );

    const cbCreateGroup = useFunction(() => {
        const newGroup = [...(data?.group ?? [])];
        newGroup.push({
            pattern: '',
            cumulative_open_order: 0,
            exposure: 0,
            exposure_limit_leverage: 0,
            position: 0,
            turnover: 0,
        });

        setData({
            ...data,
            group: newGroup,
        });
        setHasChanges(true);
    });

    const cbCloneGroup = useFunction((groupIndex: number) => {
        assert(!isNil(data), 'form data is not defined');
        const group = data.group?.[groupIndex];
        assert(!isNil(group), 'group is not found');

        setData({
            ...data,
            group: [...(data.group ?? []), group],
        });
        setHasChanges(true);
    });

    const cbDeleteGroup = useFunction((groupIndex: number) => {
        assert(!isNil(data), 'form data is not defined');
        setData({
            ...data,
            group: data.group?.filter((_, index) => index !== groupIndex),
        });
        setHasChanges(true);
    });

    useEffect(() => {
        void cbLoadData();
    }, [cbLoadData]);

    return (
        <PageLayout
            title="NSE Risk Management"
            error={error}
            loading={loading}
            headerExtra={
                <Button.Group>
                    <Button
                        title="Submit changes"
                        onClick={cbSubmit}
                        type="primary"
                        loading={loading}
                        disabled={loading || !hasChanges}
                    >
                        Submit
                    </Button>
                    <Button
                        title="Reset changes & reload data"
                        icon={<UndoOutlined />}
                        onClick={cbLoadData}
                        disabled={loading}
                    />
                </Button.Group>
            }
            onRetryLoadData={cbLoadData}
        >
            <Groups
                data={data}
                onEditGroupField={cbEditField}
                onCreateGroup={cbCreateGroup}
                onCloneGroup={cbCloneGroup}
                onDeleteGroup={cbDeleteGroup}
            />
        </PageLayout>
    );
};
