import moment from 'moment';

export interface LocalDateReference {
    sourceMsg: string;
    start: moment.Moment;
    end?: moment.Moment;
    tz: string;
}

export interface MessageTimeContext {
    senderId: string;
    sentTime: moment.Moment;
    content: LocalDateReference[];
}
