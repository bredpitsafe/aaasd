import { CopyOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from '@frontend/common/src/components/Button';
import { Error } from '@frontend/common/src/components/Error/view';
import { Col, Row } from '@frontend/common/src/components/Grid';
import { isEmpty } from 'lodash-es';
import type { ReactElement } from 'react';
import * as React from 'react';

import type { TRiskSettings, TRiskSettingsGroup } from '../../def';
import { Table } from '../Table/Table';
import { cnGroupActions, cnGroupRow } from './Groups.css';

type TGroupsProps = {
    data: TRiskSettings | undefined;
    onEditGroupField: (
        groupIndex: number,
        field: keyof TRiskSettingsGroup,
        value: TRiskSettingsGroup[keyof TRiskSettingsGroup],
    ) => void;
    onCreateGroup: () => void;
    onCloneGroup: (groupIndex: number) => void;
    onDeleteGroup: (groupIndex: number) => void;
};

const fields: (keyof TRiskSettingsGroup)[] = [
    'pattern',
    'cumulative_open_order',
    'position',
    'turnover',
    'exposure',
    'exposure_limit_leverage',
];
export const Groups = (props: TGroupsProps): ReactElement => {
    if (isEmpty(props.data?.group)) {
        return (
            <Error
                status={404}
                title="There're no groups in the config"
                extra={
                    <Button icon={<PlusOutlined />} onClick={() => props.onCreateGroup()}>
                        New Group
                    </Button>
                }
            />
        );
    }

    return (
        <Row gutter={[0, 16]} className={cnGroupRow}>
            {props.data?.group?.map((riskSettings, index) => (
                <Col span={24} key={index}>
                    <Row gutter={0}>
                        <Col span={20}>
                            <h2>{riskSettings['pattern']}</h2>
                        </Col>
                        <Col span={4} className={cnGroupActions}>
                            <Button.Group size="small">
                                <Button
                                    title="Add new group"
                                    icon={<PlusOutlined />}
                                    onClick={() => props.onCreateGroup()}
                                />
                                <Button
                                    title="Clone group"
                                    icon={<CopyOutlined />}
                                    onClick={() => props.onCloneGroup(index)}
                                />
                                <Button
                                    title="Delete group"
                                    icon={<MinusOutlined />}
                                    onClick={() => props.onDeleteGroup(index)}
                                />
                            </Button.Group>
                        </Col>
                        <Col span={24}>
                            <Table
                                fields={fields}
                                data={riskSettings}
                                onEditField={(field, value) => {
                                    props.onEditGroupField(index, field, value);
                                }}
                            />
                        </Col>
                    </Row>
                </Col>
            ))}
        </Row>
    );
};
