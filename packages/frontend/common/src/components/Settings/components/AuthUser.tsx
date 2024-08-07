import type { Nil } from '@common/types';

import type { TUser } from '../../../modules/user';
import { Col, Row } from '../../Grid.tsx';
import { Input } from '../../Input.tsx';
import { cnField, cnLabel } from './view.css.ts';

export type TAuthUserProps = {
    user: TUser | Nil;
};
export const AuthUser = (props: TAuthUserProps) => {
    return (
        <Row gutter={[8, 16]}>
            <Col className={cnLabel} span={4}>
                User
            </Col>
            <Col flex="auto">
                <Input className={cnField} value={props.user?.username} readOnly />
            </Col>
        </Row>
    );
};
