import { Text } from '../../base/elements/text';
export enum EMessageNoticeSelectors {
    SuccessMessagePopUp = '[class*="messages_cnMessage"]',
    ErrorMessagePopUp = '[class*=ant-message-error]',
    NotificationMessagePopUp = '[class*="ant-notification"]',
    NoticeMessagePopUp = '[class*="ant-message-notice"]',
}

class MessageNotice {
    readonly successMessagePopUp = new Text(EMessageNoticeSelectors.SuccessMessagePopUp, false);
    readonly errorMessagePopUp = new Text(EMessageNoticeSelectors.ErrorMessagePopUp, false);
    readonly notificationMessagePopUp = new Text(
        EMessageNoticeSelectors.NotificationMessagePopUp,
        false,
    );
    readonly noticeMessagePopUp = new Text(EMessageNoticeSelectors.NoticeMessagePopUp, false);

    successCheckMessage(message: string): void {
        this.successMessagePopUp.checkContain(message, 30000);
    }

    checkErrorMessage(message: string): void {
        this.errorMessagePopUp.checkContain(message);
    }

    checkNotificationMessage(message: string): void {
        this.notificationMessagePopUp.checkContain(message);
    }

    checkNoticeMessage(message: string): void {
        this.successMessagePopUp.checkContain(message);
    }
}

export const messageNotice = new MessageNotice();
