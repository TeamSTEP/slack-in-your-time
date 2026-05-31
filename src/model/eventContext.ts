export interface DateReference {
    start: Date; // date should be in local time (including GMT offset)
    tz: string; // IANA timezone identifier (e.g. Asia/Tokyo)
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
