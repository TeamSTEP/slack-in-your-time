import * as Helpers from '../src/helper';
import moment from 'moment';

const DATE_FORMAT = 'YYYY-MM-DD hh:mm A';

const formatDateString = (date: Date) => {
    const parsedDate = moment(date);
    return parsedDate.format(DATE_FORMAT);
};

beforeAll(() => {
    process.env.SLACK_SIGNING_SECRET = 'my-test-secret';
    process.env.SLACK_BOT_TOKEN = 'my-test-token';
});

describe('read time from message', () => {
    it('should correctly parse the time in the message', () => {
        const senderTimezoneLabel = 'Asia/Tokyo'; // GMT+9
        const today = moment('2021-05-02 10:00 AM', DATE_FORMAT, true).tz(senderTimezoneLabel, true);
        const eventTimestamp = today.clone().utc().unix(); // epoch time in seconds

        const ambiguousMsg = '2 PM';
        const casualMsg = 'from tomorrow after noon until next week';

        const parsedTime = Helpers.parseTimeReference(ambiguousMsg, eventTimestamp, senderTimezoneLabel)[0];
        const casualParse = Helpers.parseTimeReference(casualMsg, eventTimestamp, senderTimezoneLabel);

        expect(formatDateString(parsedTime.start)).toEqual('2021-05-02 02:00 PM');

        expect(moment(casualParse[0].start).date()).toEqual(3);
        expect(moment(casualParse[1].start).date()).toEqual(9);
    });
});
