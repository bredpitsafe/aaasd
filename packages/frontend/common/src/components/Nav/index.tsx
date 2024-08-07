import type { ReactElement } from 'react';

import { ENavType } from '../../actors/Settings/types.ts';
import { useModule } from '../../di/react.tsx';
import { ModuleLayouts } from '../../modules/layouts';
import { ModuleRouter } from '../../modules/router';
import { useFunction } from '../../utils/React/useFunction.ts';
import { useSyncObservable } from '../../utils/React/useSyncObservable.ts';
import { useNavType } from '../Settings/hooks/useNavType';
import type { TNavProps } from './view';
import { Nav } from './view';

export type TConnectedNavProps = Omit<
    TNavProps,
    'type' | 'onTypeChange' | 'appName' | 'navTypeLoading'
>;

export function ConnectedNav(props: TConnectedNavProps): ReactElement {
    const [navType, setNavType, , loading] = useNavType();
    const { setParams } = useModule(ModuleRouter);
    const { singleTabMode$ } = useModule(ModuleLayouts);

    const singleTab = useSyncObservable(singleTabMode$);
    const cbExitSingleTabMode = useFunction(() => setParams({ singleTab: undefined }));

    return (
        <Nav
            type={navType ?? ENavType.Small}
            onTypeChange={setNavType}
            {...props}
            singleTabMode={singleTab}
            onExitSingleTabMode={cbExitSingleTabMode}
            navTypeLoading={loading}
        />
    );
}
