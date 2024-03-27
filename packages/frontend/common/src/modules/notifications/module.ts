import { EContextTag, hasTag, ModuleFactory } from '../../di';
import { getRandomUint32 } from '../../utils/random';
import { getNowMilliseconds } from '../../utils/time';
import {
    addNotificationToList,
    clearList,
    createUINotificationManager,
    deleteFromList,
    listNotificationsBox,
} from './data';
import { ENotificationsType, IModuleNotifications, TNotification, TNotificationProps } from './def';

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

export const SafeModuleNotifications = ModuleFactory((ctx) => {
    if (!hasTag(ctx, EContextTag.UI)) {
        throw new Error('ModuleNotifications can be used only in UI context');
    }

    return createModule();
});

function toFullProps(props: TNotificationProps, type: ENotificationsType): TNotification {
    return {
        ...props,
        id: props.id || String(getRandomUint32()),
        timestamp: props.timestamp || getNowMilliseconds(),
        type,
    };
}
