import { memo } from 'react';

import { Col, Row } from '../../Grid';
import { Input } from '../../Input';
import { cnField, cnLabel } from './view.css';

export type TBuildNumberSettingsProps = {
    buildNumber?: string;
};

export const BuildNumber = memo(({ buildNumber }: TBuildNumberSettingsProps) => (
    <Row gutter={[8, 16]}>
        <Col className={cnLabel} span={4}>
            Build
        </Col>
        <Col flex="auto">
            <Input className={cnField} value={buildNumber} readOnly />
        </Col>
    </Row>
));
