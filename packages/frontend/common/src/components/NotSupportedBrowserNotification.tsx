import { EApplicationName } from '@common/types';
import cn from 'classnames';
import type { Browser } from 'detect-browser';
import { detect } from 'detect-browser';
import { capitalize, isEmpty, isNil } from 'lodash-es';
import type { ReactNode } from 'react';
import { memo, useMemo } from 'react';

import { cnFit } from '../utils/css/common.css';
import { useFunction } from '../utils/React/useFunction';
import { Alert } from './Alert';
import { useLocalStorage } from './hooks/useLocalStorage';
import { cnContentContainer, cnWarning, cnWarningContainer } from './style.css';

const BROWSER_NAME = detect()?.name as Browser | undefined;
const SUPPORTED_BROWSERS: Browser[] = ['chrome', 'yandexbrowser', 'edge-chromium', 'opera'];
const IS_NOT_SUPPORTED_BROWSER = isNil(BROWSER_NAME) || !SUPPORTED_BROWSERS.includes(BROWSER_NAME);

export const NotSupportedBrowserNotification = memo(
    ({
        appName = EApplicationName.Common,
        children,
    }: {
        appName?: EApplicationName;
        children: ReactNode;
    }) => {
        const [show, setShown] = useLocalStorage(
            useMemo(() => `${appName}_NOT_SUPPORTED_BROWSER`, [appName]),
            IS_NOT_SUPPORTED_BROWSER,
        );

        const cbClose = useFunction(() => setShown(false));

        if (!IS_NOT_SUPPORTED_BROWSER) {
            return <>{children}</>;
        }

        return (
            <div className={cnWarningContainer}>
                {show && (
                    <Alert
                        className={cnWarning}
                        type="warning"
                        message={`${
                            isEmpty(BROWSER_NAME) ? 'Current browser' : capitalize(BROWSER_NAME)
                        } may not support some functionality, guaranteed to work only in Chromium browsers, such as Google Chrome, Yandex Browser, Edge, Opera.`}
                        showIcon
                        closable
                        onClose={cbClose}
                    />
                )}
                <div className={cn(cnFit, cnContentContainer)}>{children}</div>
            </div>
        );
    },
);
