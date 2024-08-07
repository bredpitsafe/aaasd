import type { EApplicationName } from '@common/types';
import cn from 'classnames';

import type { TWithClassname } from '../../types/components.ts';
import { appNameToAppTitle } from '../../utils/getPathToRoot.ts';
import { getAppIconUrl } from '../../utils/urlBuilders.ts';
import { cnLogo } from './AppLogo.css.ts';

type TAppLogoProps = TWithClassname & {
    appName: EApplicationName;
};

export const AppLogo = (props: TAppLogoProps) => {
    const { appName, className } = props;

    const title = appNameToAppTitle(appName);
    return (
        <img
            className={cn(cnLogo, className)}
            src={getAppIconUrl(appName)}
            alt={title}
            title={title}
        />
    );
};
