import * as Helpers from '../src/helper';
import { DateTime } from 'luxon';

const DATE_FORMAT = 'yyyy-MM-dd hh:mm a';

const formatDateString = (date: Date, zone: string) => {
    return DateTime.fromJSDate(date, { zone }).toFormat(DATE_FORMAT);
};

beforeAll(() => {
    process.env.SLACK_SIGNING_SECRET = 'my-test-secret';
    process.env.SLACK_BOT_TOKEN = 'my-test-token';
});

describe('read time from message', () => {
    const senderTimezoneLabel = 'Asia/Tokyo';
    const today = DateTime.fromFormat('2021-05-02 10:00 AM', DATE_FORMAT, { zone: senderTimezoneLabel });
    const eventTimestamp = today.toUTC().toSeconds();

    it('should parse an ambiguous time reference relative to the event timestamp', () => {
        const parsedTime = Helpers.parseTimeReference('2 PM', eventTimestamp, senderTimezoneLabel)[0];

        expect(formatDateString(parsedTime.start, senderTimezoneLabel)).toEqual('2021-05-02 02:00 PM');
    });

    it('should parse multiple explicit dates in a single message', () => {
        const casualParse = Helpers.parseTimeReference(
            'May 3 at noon and May 9 at 3pm',
            eventTimestamp,
            senderTimezoneLabel,
        );

        expect(casualParse).toHaveLength(2);
        expect(DateTime.fromJSDate(casualParse[0].start, { zone: senderTimezoneLabel }).day).toEqual(3);
        expect(DateTime.fromJSDate(casualParse[1].start, { zone: senderTimezoneLabel }).day).toEqual(9);
    });
});

describe('timezone helpers', () => {
    it('should validate IANA timezone identifiers', () => {
        expect(Helpers.assertValidTimezone('America/New_York')).toEqual('America/New_York');
        expect(() => Helpers.assertValidTimezone('Not/AZone')).toThrow('Time zone Not/AZone does not exist');
    });

    it('should convert the same instant across timezones without changing the underlying timestamp', () => {
        const source = new Date('2021-05-02T05:00:00.000Z');
        const converted = Helpers.convertInstantToZone(source, 'Europe/London');

        expect(converted.getTime()).toEqual(source.getTime());
    });

    it('should format dates in the requested timezone', () => {
        const instant = new Date('2021-05-02T05:00:00.000Z');
        const tokyo = Helpers.formatInTimezone(instant, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');
        const newYork = Helpers.formatInTimezone(instant, 'America/New_York', 'yyyy-MM-dd HH:mm');

        expect(tokyo).toEqual('2021-05-02 14:00');
        expect(newYork).toEqual('2021-05-02 01:00');
    });
});

describe('getUserTimeZones', () => {
    it('should return unique timezone labels for channel members', () => {
        const timezones = Helpers.getUserTimeZones([
            { tz: 'Asia/Tokyo' } as never,
            { tz: 'America/New_York' } as never,
            { tz: 'Asia/Tokyo' } as never,
        ]);

        expect(timezones).toEqual(['Asia/Tokyo', 'America/New_York']);
    });
});
