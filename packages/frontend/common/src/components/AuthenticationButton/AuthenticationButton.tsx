import { UserOutlined } from '@ant-design/icons';
import cn from 'classnames';
import { isNull, isUndefined } from 'lodash-es';
import { ReactElement, useMemo } from 'react';

import {
    AuthenticationProps,
    EAuthenticationSelectors,
} from '../../../e2e/selectors/authentication';
import { ESessionTypes } from '../../modules/session';
import { Button } from '../Button';
import { Tooltip } from '../Tooltip';
import { cnLoggedOut } from './AuthenticationButton.css';

type TSupportedTypes = Exclude<ESessionTypes, ESessionTypes.AuthNotRequired>;
type TAuthenticationButtonProps = {
    state?: TSupportedTypes;
    userName?: null | string;
    onClick: () => void;
};

export function AuthenticationButton(props: TAuthenticationButtonProps): ReactElement {
    const { state, onClick, userName } = props;

    const className = useMemo(
        () =>
            cn({
                [cnLoggedOut]: state === ESessionTypes.NotAuth,
            }),
        [state],
    );

    const loading =
        isUndefined(state) ||
        isUndefined(userName) ||
        (state === ESessionTypes.Auth && isNull(userName)) ||
        (state === ESessionTypes.NotAuth && !isNull(userName));

    return (
        <Tooltip
            placement="right"
            mouseEnterDelay={0.5}
            title={
                state === ESessionTypes.Auth ? `Logged in as ${userName ?? ''}` : 'Click to log in'
            }
        >
            <Button
                {...AuthenticationProps[EAuthenticationSelectors.LogOutButton]}
                icon={<UserOutlined className={className} />}
                type="text"
                loading={loading}
                onClick={onClick}
            />
        </Tooltip>
    );
}
