import * as Helpers from '../src/helper';
import moment from 'moment';

beforeAll(() => {
    process.env.SLACK_SIGNING_SECRET = 'my-test-secret';
    process.env.SLACK_BOT_TOKEN = 'my-test-token';
});

describe('read time from message', () => {
    it('should correctly parse the time in the message', () => {
        const dateFormat = 'YYYY-MM-DD hh:mm A';
        const senderTimezoneLabel = 'Asia/Muscat'; // GMT+4
        const today = moment('2021-05-02 10:00 AM', dateFormat).tz(senderTimezoneLabel);
        const eventTimestamp = today.unix(); // epoch time in seconds

        const ambiguousMsg = '2 PM';
        const casualMsg = 'tomorrow after noon till next week';

        const parsedTime = Helpers.parseTimeReference(ambiguousMsg, eventTimestamp, senderTimezoneLabel)[0];
        const casualParse = Helpers.parseTimeReference(casualMsg, eventTimestamp, senderTimezoneLabel);

        expect(parsedTime.start.format(dateFormat)).toEqual('2021-05-02 02:00 PM');

        expect(casualParse[0].start.date()).toEqual(3);
        expect(casualParse[0].end?.date()).toEqual(9);
    });
});
