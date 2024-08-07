import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { statusMessagesTab } from '../../../../../../lib/page-objects/common/components/status-messages/status-messages.tab';
import { ETime } from '../../../../../../lib/page-objects/common/time';
import { dateChange } from '../../../../../data/date';

Given(`user not sees a message in the "Status Messages" tab`, () => {
    statusMessagesTab.checkNotMessages();
});

Given(`user sees a new message in the "Status Messages" tab`, () => {
    statusMessagesTab.statusMessagesText.checkContain(dateChange(ETime.Now));
});

Given(`user sees a message {string} in the "Status Messages" tab`, (statusMessage: string) => {
    statusMessagesTab.statusMessagesBody.checkContain(statusMessage);
});

Given(`user sees a new time message in the "Status Messages" tab`, () => {
    statusMessagesTab.statusMessagesText.checkContain(dateChange(ETime.Now));
});
