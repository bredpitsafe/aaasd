import { memo } from 'react';

import { TSettingsStoreName } from '../../../actors/Settings/db';
import { SettingsContainer, TSettingsContainerProps } from '../Container';
import { BuildNumber, TBuildNumberSettingsProps } from './BuildNumber';
import { DownloadLogsAndResetCache, TDownloadLogsSettingsProps } from './DownloadLogsAndResetCache';
import { Fingerprint, TFingerprintSettingsProps } from './Fingerprint';
import { HelpLink } from './HelpLink';
import { LayoutDraftUnsavedWarning } from './LayoutDraftUnsavedWarning';
import { SocketName, TSocketNameSettingsProps } from './SocketName';
import { SyncLayouts } from './SyncLayouts';

export enum EGeneralSettingsSection {
    StageSelector = 'StageSelector',
    SyncLayouts = 'SyncLayouts',
    UnsavedLayoutAlert = 'UnsavedLayoutAlert',
}
export type TGeneralSettingsProps = Partial<
    TBuildNumberSettingsProps &
        TDownloadLogsSettingsProps &
        TFingerprintSettingsProps &
        TSocketNameSettingsProps &
        TSettingsContainerProps
> & {
    settingsStoreName: TSettingsStoreName;
    settingsToHide?: EGeneralSettingsSection[];
};

export const GeneralPage = memo(
    ({
        buildNumber,
        fingerprint,
        onDownloadLogs,
        children,
        advancedChildren,
        onChangeSocket,
        settingsToHide,
        settingsStoreName,
    }: TGeneralSettingsProps) => {
        const hideStageSelector =
            settingsToHide?.includes(EGeneralSettingsSection.StageSelector) ?? false;
        const hideSyncLayouts =
            settingsToHide?.includes(EGeneralSettingsSection.SyncLayouts) ?? false;
        const hideUnsavedLayoutAlert =
            settingsToHide?.includes(EGeneralSettingsSection.UnsavedLayoutAlert) ?? false;

        return (
            <SettingsContainer advancedChildren={advancedChildren}>
                {!hideStageSelector ? (
                    <SocketName
                        onChangeSocket={onChangeSocket}
                        settingsStoreName={settingsStoreName}
                    />
                ) : null}
                <BuildNumber buildNumber={buildNumber} />
                <Fingerprint fingerprint={fingerprint} />
                {!hideSyncLayouts && <SyncLayouts />}
                {!hideUnsavedLayoutAlert && <LayoutDraftUnsavedWarning />}
                {children}
                <DownloadLogsAndResetCache onDownloadLogs={onDownloadLogs} />
                <HelpLink />
            </SettingsContainer>
        );
    },
);
