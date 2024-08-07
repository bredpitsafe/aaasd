import { memo } from 'react';

import { Col, Row } from '../../Grid';
import { Input } from '../../Input';
import { cnField, cnLabel } from './view.css';

export type TFingerprintSettingsProps = {
    fingerprint?: string;
};

export const Fingerprint = memo(({ fingerprint }: TFingerprintSettingsProps) => (
    <Row gutter={[8, 16]}>
        <Col className={cnLabel} span={4}>
            Fingerprint
        </Col>
        <Col flex="auto">
            <Input className={cnField} value={fingerprint ?? ''} readOnly />
        </Col>
    </Row>
));
