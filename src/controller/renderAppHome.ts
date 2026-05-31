import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import * as View from '../view';
import { Users } from '../model';
import { getLogger } from '../config';

export const displayAppHomeTab: Middleware<SlackEventMiddlewareArgs<'app_home_opened'>> = async ({ client, event }) => {
    try {
        const userId = event.user;

        const userInfo = (await client.users.info({
            user: userId,
            include_locale: true,
        })) as Users.InfoResponse;

        const homeBlock = View.appHomeBlock({ userInfo: userInfo.user });

        await client.views.publish({
            user_id: userId,
            view: {
                type: 'home',
                blocks: homeBlock,
            },
        });
    } catch (err) {
        getLogger().error({ err, userId: event.user }, 'Failed to render app home tab');
    }
};
