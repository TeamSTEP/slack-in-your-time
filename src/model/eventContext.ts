import moment from 'moment';

export interface DateReference {
    start: moment.Moment;
    end?: moment.Moment;
    tz: string; // time zone abbreviation symbol (https://www.timeanddate.com/time/zones/)
}

export interface LocalDateReference extends DateReference {
    sourceMsg: string;
}

export interface MessageTimeContext {
    senderId: string;
    sentChannel: string;
    sentTime: moment.Moment;
    content: LocalDateReference[];
}
