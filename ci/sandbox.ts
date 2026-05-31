#!/usr/bin/env ts-node

import * as chrono from 'chrono-node';
import { DateTime } from 'luxon';
import { assertValidTimezone } from '../src/helper/timezone';

const nowInLocale = (timezone: string) => {
    const zone = assertValidTimezone(timezone);
    return DateTime.now().setZone(zone);
};

(async () => {
    const localTimezone = 'America/Los_Angeles';
    const senderTimezone = 'Asia/Tokyo';

    const displayFormat = 'MMMM cccc dd yyyy, h:mm a';

    console.log('hello worlds!');

    const nowLocalTime = nowInLocale(localTimezone);
    const nowSenderTime = nowInLocale(senderTimezone);
    const message = 'what about we have a meeting on this Friday?';

    const senderMeetingDate = DateTime.fromJSDate(chrono.parseDate(message, nowSenderTime.toJSDate()) as Date, {
        zone: senderTimezone,
    });
    const convertedToLocal = senderMeetingDate.setZone(localTimezone);

    console.log(`message sent: ${message}\n`);
    console.log(`now in local time ${nowLocalTime.zoneName}: ${nowLocalTime.toFormat(displayFormat)}`);
    console.log(`sender meeting date: ${senderMeetingDate.toFormat(displayFormat)} - ${senderMeetingDate.zoneName}`);
    console.log(`local meeting date: ${convertedToLocal.toFormat(displayFormat)} - ${convertedToLocal.zoneName}`);

    process.exit(0);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
