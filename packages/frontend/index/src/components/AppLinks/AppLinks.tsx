import { AppLogo } from '@frontend/common/src/components/AppLogo/AppLogo.tsx';
import { cnLink } from '@frontend/common/src/components/Link/index.css.ts';
import { UI_APPS } from '@frontend/common/src/types/app.ts';
import type { TWithClassname } from '@frontend/common/src/types/components.ts';
import { getAppUrl } from '@frontend/common/src/utils/urlBuilders.ts';
import cn from 'classnames';

import { FavoriteStages } from '../FavoriteStages/FavoriteStages.tsx';
import { cnLinkInner, cnLinks, cnLogo, cnLogoContainer, cnRoot } from './AppLinks.css.ts';
import logo from './logo.png';

type TAppLinksProps = TWithClassname;

export const AppLinks = (props: TAppLinksProps) => {
    const { className } = props;
    return (
        <div className={cn(cnRoot, className)}>
            <div className={cnLogoContainer}>
                <img className={cnLogo} src={logo} alt="logo" />
            </div>
            <div className={cnLinks}>
                {UI_APPS.map(({ name, title, url }) => {
                    return (
                        <FavoriteStages key={name} appName={name}>
                            <a className={cn(cnLink, cnLinkInner)} href={getAppUrl(url)}>
                                <AppLogo appName={name} />
                                {title}
                            </a>
                        </FavoriteStages>
                    );
                })}
            </div>
        </div>
    );
};
