import * as Helpers from '../src/helper';
import moment from 'moment';

const DATE_FORMAT = 'YYYY-MM-DD hh:mm A';

const formatDateString = (date: Date) => {
    const parsedDate = moment(date);
    return parsedDate.format(DATE_FORMAT);
};

// todo: add a mock Slack application instance for sending packets and listening to responses
beforeAll(() => {
    process.env.SLACK_SIGNING_SECRET = 'my-test-secret';
    process.env.SLACK_BOT_TOKEN = 'my-test-token';
});

describe('read time from message', () => {
    const senderTimezoneLabel = 'Asia/Tokyo';
    const today = moment('2021-05-02 10:00 AM', DATE_FORMAT, true).tz(senderTimezoneLabel, true);
    const eventTimestamp = today.clone().utc().unix();

    it('should parse an ambiguous time reference relative to the event timestamp', () => {
        const parsedTime = Helpers.parseTimeReference('2 PM', eventTimestamp, senderTimezoneLabel)[0];

        expect(formatDateString(parsedTime.start)).toEqual('2021-05-02 02:00 PM');
    });

    it('should parse multiple explicit dates in a single message', () => {
        const casualParse = Helpers.parseTimeReference(
            'May 3 at noon and May 9 at 3pm',
            eventTimestamp,
            senderTimezoneLabel,
        );

        expect(casualParse).toHaveLength(2);
        expect(moment(casualParse[0].start).date()).toEqual(3);
        expect(moment(casualParse[1].start).date()).toEqual(9);
    });
});
