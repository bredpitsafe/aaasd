import { getNowISO } from '@common/utils';

export const getPlatformTimeResponse = () => ({
    platformTime: getNowISO(),
});
