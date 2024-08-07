import { getNowMilliseconds } from '@common/utils';

import { ModuleFactory } from '../../di';
import { getRandomUint32 } from '../../utils/random';
import {
    addNotificationToList,
    clearList,
    createUINotificationManager,
    deleteFromList,
    listNotificationsBox,
} from './data';
import type { IModuleNotifications, TNotification, TNotificationProps } from './def';
import { ENotificationsType } from './def';

function createModule(): IModuleNotifications {
    const addNotificationToUI = createUINotificationManager();

    function add(props: TNotification) {
        addNotificationToUI(props);
        addNotificationToList(props);
    }

    return {
        list$: listNotificationsBox.obs,
        clearList,
        deleteFromList,

        open(props): void {
            add(toFullProps(props, props.type ?? ENotificationsType.Error));
        },
        info(props): void {
            add(toFullProps(props, ENotificationsType.Info));
        },
        success(props): void {
            add(toFullProps(props, ENotificationsType.Success));
        },
        warning(props): void {
            add(toFullProps(props, ENotificationsType.Warning));
        },
        error(props): void {
            add(toFullProps(props, ENotificationsType.Error));
        },
    };
}

export const ModuleNotifications = ModuleFactory(createModule);
/**
 * @deprecated Use ModuleNotifications instead
 */
export const SafeModuleNotifications = ModuleNotifications;

function toFullProps(props: TNotificationProps, type: ENotificationsType): TNotification {
    return {
        ...props,
        id: props.id || String(getRandomUint32()),
        timestamp: props.timestamp || getNowMilliseconds(),
        type,
    };
}
