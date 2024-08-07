import type { TimeZone } from '@common/types';
import { getNowDayjs, parseToDayjsInTimeZone } from '@common/utils';
import generatePicker from 'antd/lib/date-picker/generatePicker';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import memoize from 'memoizee';
import type { GenerateConfig } from 'rc-picker/lib/generate';

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);

export const datePickerWithTimeZoneBuilder = memoize(
    (timeZone: TimeZone) => generatePicker(getConfig(timeZone)),
    { primitive: true, max: 10 },
);

export function rangeDatePickerWithTimeZoneBuilder(timeZone: TimeZone) {
    return datePickerWithTimeZoneBuilder(timeZone).RangePicker;
}

// Modification of https://github.com/react-component/picker/blob/master/src/generate/dayjs.ts with timeZone

const localeMap = {
    bn_BD: 'bn-bd',
    by_BY: 'be',
    en_GB: 'en-gb',
    en_US: 'en',
    fr_BE: 'fr', // TODO: dayjs has no fr_BE locale, use fr at present
    fr_CA: 'fr-ca',
    hy_AM: 'hy-am',
    kmr_IQ: 'ku',
    nl_BE: 'nl-be',
    pt_BR: 'pt-br',
    zh_CN: 'zh-cn',
    zh_HK: 'zh-hk',
    zh_TW: 'zh-tw',
};

function parseLocale(locale: string) {
    const mapLocale = localeMap[locale as keyof typeof localeMap];
    return mapLocale || locale.split('_')[0];
}

function getConfig(timeZone: TimeZone): GenerateConfig<Dayjs> {
    return {
        // get
        getNow: () => getNowDayjs(timeZone),
        getFixedDate: (string) =>
            parseToDayjsInTimeZone(string, timeZone, ['YYYY-M-DD', 'YYYY-MM-DD']),
        getEndDate: (date) => date.endOf('month'),
        getWeekDay: (date) => {
            const clone = date.locale('en');
            return clone.weekday() + clone.localeData().firstDayOfWeek();
        },
        getYear: (date) => date.year(),
        getMonth: (date) => date.month(),
        getDate: (date) => date.date(),
        getHour: (date) => date.hour(),
        getMinute: (date) => date.minute(),
        getSecond: (date) => date.second(),

        // set
        addYear: (date, diff) => date.add(diff, 'year'),
        addMonth: (date, diff) => date.add(diff, 'month'),
        addDate: (date, diff) => date.add(diff, 'day'),
        setYear: (date, year) => date.year(year),
        setMonth: (date, month) => date.month(month),
        setDate: (date, num) => date.date(num),
        setHour: (date, hour) => date.hour(hour),
        setMinute: (date, minute) => date.minute(minute),
        setSecond: (date, second) => date.second(second),

        // Compare
        isAfter: (date1, date2) => date1.isAfter(date2),
        isValidate: (date) => date.isValid(),

        locale: {
            getWeekFirstDay: (locale) =>
                getNowDayjs(timeZone).locale(parseLocale(locale)).localeData().firstDayOfWeek(),
            getWeekFirstDate: (locale, date) => date.locale(parseLocale(locale)).weekday(0),
            getWeek: (locale, date) => date.locale(parseLocale(locale)).week(),
            getShortWeekDays: (locale) =>
                getNowDayjs(timeZone).locale(parseLocale(locale)).localeData().weekdaysMin(),
            getShortMonths: (locale) =>
                getNowDayjs(timeZone).locale(parseLocale(locale)).localeData().monthsShort(),
            format: (locale, date, format) => date.locale(parseLocale(locale)).format(format),
            parse: (locale, text, formats) => {
                const localeStr = parseLocale(locale);
                for (let i = 0; i < formats.length; i += 1) {
                    const format = formats[i];
                    const formatText = text;
                    if (format.includes('wo') || format.includes('Wo')) {
                        // parse Wo
                        const year = formatText.split('-')[0];
                        const weekStr = formatText.split('-')[1];
                        const firstWeek = parseToDayjsInTimeZone(year, timeZone, 'YYYY')
                            .startOf('year')
                            .locale(localeStr);
                        for (let j = 0; j <= 52; j += 1) {
                            const nextWeek = firstWeek.add(j, 'week');
                            if (nextWeek.format('Wo') === weekStr) {
                                return nextWeek;
                            }
                        }
                        return null;
                    }
                    const date = parseToDayjsInTimeZone(formatText, timeZone, format, true).locale(
                        localeStr,
                    );

                    if (date.isValid()) {
                        return date;
                    }
                }

                return null;
            },
        },
    };
}
