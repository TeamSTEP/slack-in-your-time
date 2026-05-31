import { DateTime, IANAZone } from 'luxon';

export const DEFAULT_TIMEZONE = 'Etc/GMT';

export const assertValidTimezone = (timezone: string): string => {
    if (!IANAZone.isValidZone(timezone)) {
        throw new Error(`Time zone ${timezone} does not exist`);
    }

    return timezone;
};

export const resolveTimezone = (timezone?: string): string => {
    return assertValidTimezone(timezone || DEFAULT_TIMEZONE);
};

export const getLocalTimezone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
};

export const fromUnixInZone = (seconds: number, zone: string): DateTime => {
    return DateTime.fromSeconds(seconds, { zone: resolveTimezone(zone) });
};

export const convertInstantToZone = (date: Date, zone: string): Date => {
    return DateTime.fromJSDate(date).setZone(resolveTimezone(zone)).toJSDate();
};

export const formatInTimezone = (date: Date, zone: string, format: string): string => {
    return DateTime.fromJSDate(date, { zone: resolveTimezone(zone) }).toFormat(format);
};

/**
 * Builds a reference Date for chrono-node using the sender's wall-clock time.
 * Chrono reads reference dates in the system local timezone, so we map the sender's
 * local components into a Date object that preserves the intended wall time.
 */
export const chronoReferenceFromSenderZone = (seconds: number, zone: string): Date => {
    const senderLocal = fromUnixInZone(seconds, zone);

    return new Date(
        senderLocal.year,
        senderLocal.month - 1,
        senderLocal.day,
        senderLocal.hour,
        senderLocal.minute,
        senderLocal.second,
    );
};

export const dateFromChronoInZone = (date: Date, zone: string): Date => {
    return DateTime.fromObject(
        {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds(),
        },
        { zone: resolveTimezone(zone) },
    ).toJSDate();
};
