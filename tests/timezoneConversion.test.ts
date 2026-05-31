import { DateTime } from 'luxon';
import * as Helpers from '../src/helper';

describe('timezone conversion across regions', () => {
    it('should keep wall-clock meaning when converting parsed references between zones', () => {
        const senderTimezoneLabel = 'Asia/Tokyo';
        const referenceTime = DateTime.fromObject(
            { year: 2021, month: 5, day: 2, hour: 14, minute: 0 },
            { zone: senderTimezoneLabel },
        );
        const eventTimestamp = referenceTime.toUTC().toSeconds();

        const parsedTime = Helpers.parseTimeReference('2 PM', eventTimestamp, senderTimezoneLabel)[0];
        const londonDate = Helpers.convertInstantToZone(parsedTime.start, 'Europe/London');

        expect(Helpers.formatInTimezone(londonDate, 'Europe/London', 'yyyy-MM-dd HH:mm')).toEqual('2021-05-02 06:00');
        expect(Helpers.formatInTimezone(parsedTime.start, senderTimezoneLabel, 'yyyy-MM-dd HH:mm')).toEqual(
            '2021-05-02 14:00',
        );
    });
});
