import { App, LogLevel, Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { Users, Conversations } from './models';
import _ from 'lodash';

export default async function main() {
    // Initializes your app with your bot token and signing secret
    const app = new App({
        token: process.env.SLACK_BOT_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        logLevel: LogLevel.DEBUG,
    });

    const teamMemberList = (await app.client.users.list({
        include_locale: true,
        token: process.env.SLACK_BOT_TOKEN,
    })) as Users.ListResponse;

    const contextChannelMembers: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({
        payload,
        context,
        next,
    }) => {
        const { members } = (await app.client.conversations.members({
            token: context.botToken,
            channel: payload.channel,
        })) as Conversations.MembersResponse;

        const thisChanMembers = members.map((user) => {
            // we know that the member ID is in the list
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return _.find(teamMemberList.members, (i) => {
                return i.id === user;
            })!;
        });

        // Add user's timezone context
        context.members = thisChanMembers;

        // Pass control to the next middleware function
        next && (await next());
    };

    app.message('echo debug', contextChannelMembers, async ({ context, say, body, message }) => {
        console.log(JSON.stringify(teamMemberList));
        await say(`Context:\n${JSON.stringify({ context, body, message })}`);
    });

    // Listens to incoming messages that contain "hello"
    app.message('change time', async ({ message, say }) => {
        // say() sends a message to the channel where the event was triggered
        await say({
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text:
                            "Hey! Looks like you said: *{local_date}*\nWould you like me to convert this to everyone's local time?",
                    },
                },
                {
                    type: 'actions',
                    elements: [
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                emoji: true,
                                text: 'Yes',
                            },
                            style: 'primary',
                            value: 'click_me_123',
                            action_id: 'btn_okay',
                        },
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                emoji: true,
                                text: 'No',
                            },
                            style: 'danger',
                            value: 'click_me_123',
                            action_id: 'btn_decline',
                        },
                    ],
                },
            ],
            text: `Hey there <@${message.user}>!`,
        });
    });

    app.action('btn_okay', async ({ body, ack, say }) => {
        // Acknowledge the action
        await ack();
        await say(`<@${body.user.id}> clicked the button`);
    });

    app.action('btn_decline', async ({ body, ack, say }) => {
        // Acknowledge the action
        await ack();
        await say(`no? Really?!`);
    });

    (async () => {
        // Start your app
        await app.start(process.env.PORT || 3000);

        console.log('⚡️ Bolt app is running!');
    })();
}
