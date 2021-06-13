#!/usr/bin/env ts-node

import * as chrono from 'chrono-node';
import moment from 'moment-timezone';

const nowInLocale = (timezone: string) => {
    if (!moment.tz(timezone).isValid()) throw new Error(`Invalid time zone of ${timezone} was given`);
    // current time in UTC
    const nowUtc = moment.utc();
    // converted to local time
    return moment.tz(nowUtc, timezone);
};

(async () => {
    // source: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
    const localTimezone = 'America/Los_Angeles';
    const senderTimezone = 'Asia/Tokyo';

    const displayFormat = 'MMMM dddd DD YYYY, h:mm a';

    console.log('hello worlds!');

    // converted to local time
    const nowLocalTime = nowInLocale(localTimezone);
    const nowSenderTime = nowInLocale(senderTimezone);
    const message = 'what about we have a meeting on this Friday?';

    // new time with context
    const senderMeetingDate = moment.tz(chrono.parseDate(message, nowSenderTime.toDate()), senderTimezone);
    const convertedToLocal = moment.tz(senderMeetingDate, localTimezone);

    // display the results
    console.log(`message sent: ${message}\n`);
    console.log(`now in local time ${nowLocalTime.tz()}: ${nowLocalTime.format(displayFormat)}`);
    console.log(`sender meeting date: ${senderMeetingDate.format(displayFormat)} - ${senderMeetingDate.tz()}`);
    console.log(`local meeting date: ${convertedToLocal.format(displayFormat)} - ${convertedToLocal.tz()}`);

    process.exit(0);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
