import { createTestProps } from '../../../../index';

export enum EStatusMessagesTabSelectors {
    StatusMessagesText = 'statusMessagesText',

    StatusMessagesBody = 'statusMessagesBody',
}

export const StatusMessagesTabProps = {
    [EStatusMessagesTabSelectors.StatusMessagesText]: createTestProps(
        EStatusMessagesTabSelectors.StatusMessagesText,
    ),
    [EStatusMessagesTabSelectors.StatusMessagesBody]: createTestProps(
        EStatusMessagesTabSelectors.StatusMessagesBody,
    ),
};
