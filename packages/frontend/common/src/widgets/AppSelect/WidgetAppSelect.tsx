import type { EApplicationName } from '@common/types';

import type { TAppSelectProps } from '../../components/AppSelect/AppSelect.tsx';
import { AppSelect } from '../../components/AppSelect/AppSelect.tsx';
import { useAppName } from '../../hooks/useAppName.ts';
import { UI_APPS } from '../../types/app.ts';
import { useFunction } from '../../utils/React/useFunction.ts';
import { getAppRootUrl } from '../../utils/urlBuilders.ts';

const UI_APP_NAMES = UI_APPS.map((app) => app.name);

type TWidgetAppSelectProps = Omit<TAppSelectProps, 'apps' | 'onChange'>;

export const WidgetAppSelect = (props: TWidgetAppSelectProps) => {
    const appName = useAppName();
    const cbSelectApp = useFunction((name: EApplicationName) => {
        window.location.href = getAppRootUrl(name);
    });

    return <AppSelect apps={UI_APP_NAMES} value={appName} onChange={cbSelectApp} {...props} />;
};
