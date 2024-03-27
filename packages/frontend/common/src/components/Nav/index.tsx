import { ReactElement } from 'react';

import { TSettingsStoreName } from '../../actors/Settings/db';
import { useNavType } from '../Settings/hooks/useNavType';
import { Nav, TNavProps } from './view';

export type TConnectedNavProps = Omit<TNavProps, 'type' | 'onTypeChange'> & {
    appName: TSettingsStoreName;
};

export function ConnectedNav(props: TConnectedNavProps): ReactElement {
    const { appName, ...viewProps } = props;
    const [navType, setNavType] = useNavType(appName);
    return <Nav type={navType} onTypeChange={setNavType} {...viewProps} />;
}
