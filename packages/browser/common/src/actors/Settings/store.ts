import { createObservableBox } from '../../utils/rx';
import type { TSettingsGetter, TSettingsSetter } from './actions';
import { TSettingsStoreName } from './db';

type TSettingsStorage = Partial<
    Record<TSettingsStoreName, Record<TSettingsSetter['key'], TSettingsSetter['value']>>
>;

export const actionsBox = createObservableBox<TSettingsSetter | TSettingsGetter | undefined>(
    undefined,
);
export const settingsMapBox = createObservableBox<TSettingsStorage>({});
