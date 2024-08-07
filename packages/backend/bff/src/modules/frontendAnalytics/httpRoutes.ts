import { EHttpMethod, EHttpRouteName } from '../../transport/http/def.ts';
import { createHttpRoutes } from '../../transport/http/utils.ts';
import { appConfig } from '../../utils/appConfig.ts';
import { sendLogsHandlers } from './sendLogs.handler.ts';

export const frontendAnalyticsHttpRoutes = createHttpRoutes({
    [EHttpRouteName.SendLogs]: {
        method: EHttpMethod.POST,
        path: appConfig.frontendAnalytics.sendLogsUrl,
        handler: sendLogsHandlers,
    },
});
