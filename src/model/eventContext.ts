import moment from 'moment';

export interface DateReference {
    start: moment.Moment;
    end?: moment.Moment;
    tz: string;
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
