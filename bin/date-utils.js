const DaysInWeek = 7;

const DayOfWeek = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
};

const DaysArray = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function getStartOfTheDay(currentDate) {
    const current = new Date(currentDate);
    current.setHours(0, 0, 0, 0);
    return current;
}

function getStartOfWeek(currentDate, weekStartDay) {
    const current = getStartOfTheDay(currentDate ?? new Date());
    weekStartDay = weekStartDay ?? DayOfWeek.Monday;

    const diff = (DaysInWeek + current.getDay() - weekStartDay) % DaysInWeek;

    current.setDate(current.getDate() - diff);

    return current;
}

function addDays(date, shift) {
    const current = new Date(date);
    current.setDate(current.getDate() + shift);
    return current;
}

function addWeeks(date, shift) {
    const current = new Date(date);
    current.setDate(current.getDate() + shift * DaysInWeek);
    return current;
}

function datePartNormalized(num) {
    return num.toString().padStart(2, '0');
}

function stringifyWeekAndTime(date) {
    return `${DaysArray[date.getDay()]} ${datePartNormalized(
        date.getHours(),
    )}:${datePartNormalized(date.getMinutes())}`;
}

function stringifyDate(date, skipTime) {
    const datePart = `${DaysArray[date.getDay()]} ${datePartNormalized(
        date.getDate(),
    )}.${datePartNormalized(date.getMonth() + 1)}.${date.getFullYear()}`;

    if (skipTime) {
        return datePart;
    }

    return `${datePart} ${datePartNormalized(
        date.getHours(),
    )}:${datePartNormalized(date.getMinutes())}`;
}

module.exports = {
    getStartOfTheDay,
    getStartOfWeek,
    addDays,
    addWeeks,
    stringifyDate,
    stringifyWeekAndTime,
};
