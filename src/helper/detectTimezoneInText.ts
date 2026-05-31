import { IANAZone } from 'luxon';
import { assertValidTimezone } from './timezone';

const IANA_PATTERN = /\b([A-Za-z]+(?:\/[A-Za-z_]+)+)\b/g;

/** Common timezone abbreviations mapped to IANA zones (US-centric where ambiguous). */
const ABBREVIATION_TO_IANA: Record<string, string> = {
    UTC: 'UTC',
    GMT: 'Etc/GMT',
    EST: 'America/New_York',
    EDT: 'America/New_York',
    CST: 'America/Chicago',
    CDT: 'America/Chicago',
    MST: 'America/Denver',
    MDT: 'America/Denver',
    PST: 'America/Los_Angeles',
    PDT: 'America/Los_Angeles',
    JST: 'Asia/Tokyo',
    KST: 'Asia/Seoul',
    IST: 'Asia/Kolkata',
    CET: 'Europe/Paris',
    CEST: 'Europe/Paris',
    BST: 'Europe/London',
    AEST: 'Australia/Sydney',
    AEDT: 'Australia/Sydney',
    HKT: 'Asia/Hong_Kong',
    SGT: 'Asia/Singapore',
};

export interface DetectedTimezone {
    timezone: string;
    strippedMessage: string;
}

const findIanaTimezone = (message: string): DetectedTimezone | null => {
    const matches = [...message.matchAll(IANA_PATTERN)];

    for (const match of matches) {
        const candidate = match[1];
        if (IANAZone.isValidZone(candidate)) {
            const strippedMessage = message.replace(match[0], ' ').replace(/\s+/g, ' ').trim();
            return { timezone: assertValidTimezone(candidate), strippedMessage };
        }
    }

    return null;
};

const findAbbreviationTimezone = (message: string): DetectedTimezone | null => {
    const abbreviationPattern = /\b([A-Z]{2,4})\b/g;
    const matches = [...message.matchAll(abbreviationPattern)];

    for (const match of matches) {
        const abbreviation = match[1];
        const iana = ABBREVIATION_TO_IANA[abbreviation];
        if (!iana) continue;

        const strippedMessage = message
            .replace(new RegExp(`\\b${abbreviation}\\b`), ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return { timezone: assertValidTimezone(iana), strippedMessage };
    }

    return null;
};

/**
 * Detects an explicit timezone in message text (IANA label or common abbreviation).
 * Returns the resolved IANA zone and the message with the timezone token removed.
 */
export const detectTimezoneInText = (message: string): DetectedTimezone | null => {
    return findIanaTimezone(message) ?? findAbbreviationTimezone(message);
};
