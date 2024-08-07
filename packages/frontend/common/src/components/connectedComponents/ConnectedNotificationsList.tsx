import type { ReactElement } from 'react';
import { useObservable } from 'react-use';

import { useModule } from '../../di/react';
import { ModuleNotifications } from '../../modules/notifications/module';
import { EMPTY_ARRAY } from '../../utils/const';
import { NotificationsList as View } from '../NotificationsList/view';

export function ConnectedNotificationsList(): ReactElement {
    const { list$, deleteFromList, clearList } = useModule(ModuleNotifications);
    const list = useObservable(list$, EMPTY_ARRAY);

    return <View list={list} onCloseItem={deleteFromList} onClear={clearList} />;
}
