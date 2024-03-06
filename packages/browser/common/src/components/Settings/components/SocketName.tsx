import { memo } from 'react';

import { createTestProps } from '../../../../e2e';
import { ESettingsModalSelectors } from '../../../../e2e/selectors/settings.modal.selectors';
import { TSettingsStoreName } from '../../../actors/Settings/db';
import { TSocketName } from '../../../types/domain/sockets';
import { ConnectedStageSwitch } from '../../connectedComponents/ConnectedStageSwitch';
import { Col, Row } from '../../Grid';
import { cnField, cnLabel } from './view.css';

export type TSocketNameSettingsProps = {
    settingsStoreName: TSettingsStoreName;
    onChangeSocket?: (name: TSocketName) => void;
};

export const SocketName = memo(
    ({ onChangeSocket, settingsStoreName }: TSocketNameSettingsProps) => {
        return (
            <Row gutter={[8, 16]}>
                <Col className={cnLabel} span={4}>
                    Server
                </Col>
                <Col flex="auto" {...createTestProps(ESettingsModalSelectors.ServerSelect)}>
                    <ConnectedStageSwitch
                        className={cnField}
                        size="middle"
                        type="icon-label"
                        onChangeSocket={onChangeSocket}
                        settingsStoreName={settingsStoreName}
                    />
                </Col>
            </Row>
        );
    },
);
