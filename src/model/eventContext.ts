export interface DateReference {
    start: Date; // date should be in local time (including GMT offset)
    tz: string; // time zone abbreviation symbol (https://www.timeanddate.com/time/zones/) or from the moment timezone library (https://github.com/moment/moment-timezone/blob/develop/data/packed/latest.json)
}

export interface LocalDateReference extends DateReference {
    sourceMsg: string;
}

export interface MessageTimeContext {
    senderId: string;
    sentChannel: string;
    sentTime: number; // unix epoch time in seconds
    content: LocalDateReference[];
}
