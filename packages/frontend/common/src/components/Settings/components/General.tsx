import { memo } from 'react';

import { Divider } from '../../Divider.tsx';
import { cnDivider } from '../../Nav/view.css.ts';
import type { TSettingsContainerProps } from '../Container';
import { SettingsContainer } from '../Container';
import type { TAuthSessionProps } from './AuthSession.tsx';
import { AuthSession } from './AuthSession.tsx';
import type { TAuthUserProps } from './AuthUser.tsx';
import { AuthUser } from './AuthUser.tsx';
import type { TBuildNumberSettingsProps } from './BuildNumber';
import { BuildNumber } from './BuildNumber';
import type { TDownloadLogsSettingsProps } from './DownloadLogsAndResetCache';
import { DownloadLogsAndResetCache } from './DownloadLogsAndResetCache';
import type { TFingerprintSettingsProps } from './Fingerprint';
import { Fingerprint } from './Fingerprint';
import { HelpLink } from './HelpLink';
import { LayoutDraftUnsavedWarning } from './LayoutDraftUnsavedWarning';
import { SyncLayouts } from './SyncLayouts';

export enum EGeneralSettingsSection {
    StageSelector = 'StageSelector',
    SyncLayouts = 'SyncLayouts',
    UnsavedLayoutAlert = 'UnsavedLayoutAlert',
    ComponentsDraftAlert = 'ComponentsDraftAlert',
}
export type TGeneralSettingsProps = Partial<
    TBuildNumberSettingsProps &
        TDownloadLogsSettingsProps &
        TFingerprintSettingsProps &
        TSettingsContainerProps &
        TAuthUserProps &
        TAuthSessionProps
> & {
    settingsToHide?: EGeneralSettingsSection[];
};

export const GeneralPage = memo(
    ({
        buildNumber,
        fingerprint,
        socketName,
        session,
        user,
        onDownloadLogs,
        children,
        advancedChildren,
        settingsToHide,
    }: TGeneralSettingsProps) => {
        const hideSyncLayouts =
            settingsToHide?.includes(EGeneralSettingsSection.SyncLayouts) ?? false;
        const hideUnsavedLayoutAlert =
            settingsToHide?.includes(EGeneralSettingsSection.UnsavedLayoutAlert) ?? false;

        return (
            <SettingsContainer
                advancedChildren={advancedChildren}
                infoChildren={
                    <>
                        <BuildNumber buildNumber={buildNumber} />
                        <Fingerprint fingerprint={fingerprint} />
                        <AuthUser user={user} />
                        <AuthSession session={session} socketName={socketName} />
                        <DownloadLogsAndResetCache onDownloadLogs={onDownloadLogs} />
                        <HelpLink />
                    </>
                }
            >
                {!hideSyncLayouts && <SyncLayouts />}
                {!hideUnsavedLayoutAlert && <LayoutDraftUnsavedWarning />}
                <Divider className={cnDivider} />
                {children}
            </SettingsContainer>
        );
    },
);
