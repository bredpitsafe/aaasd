import type { Nil } from '@common/types';

import type { TSession } from '../../../actors/Session/domain.ts';
import type { TSocketName } from '../../../types/domain/sockets.ts';
import { Col, Row } from '../../Grid.tsx';
import { Input } from '../../Input.tsx';
import { cnField, cnLabel } from './view.css.ts';

export type TAuthSessionProps = {
    session: TSession | Nil;
    socketName: TSocketName | Nil;
};
export const AuthSession = (props: TAuthSessionProps) => {
    return (
        <Row gutter={[8, 16]}>
            <Col className={cnLabel} span={12}>
                Session Type ({props.socketName})
            </Col>
            <Col flex="auto">
                <Input className={cnField} value={props.session?.type} readOnly />
            </Col>
        </Row>
    );
};
