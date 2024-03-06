import { SkipFirst } from '../../../types';
import { fetchProductLogsUnbound } from './fetchProductLogs';
import { subscribeToProductLogUpdatesUnbound } from './subscribeToProductLogs';

export type TFetchProductLogs = (
    ...args: SkipFirst<Parameters<typeof fetchProductLogsUnbound>, 1>
) => ReturnType<typeof fetchProductLogsUnbound>;

export type TSubscribeToProductLogUpdates = (
    ...args: SkipFirst<Parameters<typeof subscribeToProductLogUpdatesUnbound>, 1>
) => ReturnType<typeof subscribeToProductLogUpdatesUnbound>;
