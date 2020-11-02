import _ from 'lodash';
import { Users } from '../model';
import moment from 'moment-timezone';

/**
 * Filters out bots or deleted users from the given user list
 * @param userList user list
 */
export const getOnlyActiveUsers = (userList: Users.User[]) => {
    const activeUsers = _.filter(userList, (user) => {
        return !user.is_bot && !user.deleted;
    });
    return activeUsers;
};

export const getUserTimeZones = (userList: Users.User[]) => {
    const tzList = _.map(userList, (user) => {
        const userTz = user.tz || 'Etc/GMT';

        const tz = moment.tz.zone(userTz);
        if (!tz) throw new Error(`Time zone ${user.tz} does not exist (user: ${user.name}-${user.id})`);
        return tz;
    });

    return _.uniqWith(tzList, (a, b) => {
        return a.name === b.name;
    });
};
