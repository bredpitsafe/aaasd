import type { EApplicationName } from '@common/types';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { appNameToAppTitle } from '../../utils/getPathToRoot.ts';
import { useFunction } from '../../utils/React/useFunction';
import { AppLogo } from '../AppLogo/AppLogo.tsx';
import type { TEntitySelectProps } from '../EntitySelect/EntitySelect.tsx';
import { EntitySelect } from '../EntitySelect/EntitySelect.tsx';

export type TAppSelectProps = Omit<TEntitySelectProps<EApplicationName>, 'options'> & {
    apps: EApplicationName[];
};

export const AppSelect = memo((props: TAppSelectProps) => {
    const { apps, ...selectProps } = props;
    const buildOption = useFunction((appName: EApplicationName) => ({
        label: (
            <span>
                <AppLogo appName={appName} /> {appNameToAppTitle(appName)}
            </span>
        ),
        value: appName,
    }));

    const options = useMemo(() => apps.map(buildOption), [apps, buildOption]);

    return (
        <EntitySelect
            placeholder="Select application"
            options={options}
            icon={!isNil(props.value) ? <AppLogo appName={props.value} /> : null}
            {...selectProps}
        />
    );
});
