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
        const homeBlock = View.appHomeBlock({ userInfo: userInfo.user });

        // send the message block to Slack app home tab
        await client.views.publish({
            user_id: userId,
            view: {
                type: 'home',
                blocks: homeBlock,
            },
        });
    } catch (err) {
        console.log(err);
    }
};
