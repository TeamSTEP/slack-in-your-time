import _ from 'lodash';
import { Users } from '../model';
import moment from 'moment-timezone';

/**
 * Filters out bots or deleted users from the given user list
 * @param userList user list
 */
export const getOnlyActiveUsers = (userList: Users.User[]) => {
    const slackBot = 'USLACKBOT'; // slack bot ID is fixed
    const activeUsers = _.filter(userList, (user) => {
        return !user.is_bot && !user.deleted && !slackBot;
    });
    return activeUsers;
};

/**
 * Converts a list of users to a unique list of timezones.
 * If `include_locale` was set to false or it fails to parse the timezone, timezone will default to GMT.
 * @param userList list of users with timezone labels
 */
export const getUserTimeZones = (userList: Users.User[]) => {
    if (userList.length < 1) throw new Error('Cannot convert time zones from an empty user list');

    const tzList = _.map(userList, (user) => {
        const userTz = user.tz || 'Etc/GMT';

        const tz = moment.tz.zone(userTz);
        if (!tz) throw new Error(`Time zone ${user.tz} does not exist (user: ${user.name}-${user.id})`);
        return tz;
    });

    // only return unique timezones
    return _.uniqWith(tzList, (a, b) => {
        return a.name === b.name;
    });
};
