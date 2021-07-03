import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import * as View from '../view';
import { Users } from '../model';

export const displayAppHomeTab: Middleware<SlackEventMiddlewareArgs<'app_home_opened'>> = async ({ client, event }) => {
    try {
        // obtain the current user ID
        const userId = event.user;

        const userInfo = (await client.users.info({
            user: userId,
            include_locale: true,
        })) as Users.InfoResponse;

        // generate the home block to render
        const headerBlock = View.appHomeBlock({ userId, userInfo: userInfo.user });

        // send the message block to Slack app home tab
        const res = await client.views.publish({
            user_id: userId,
            view: {
                type: 'home',
                blocks: headerBlock,
            },
        });

        console.log(res);
    } catch (err) {
        console.log(err);
    }
};
