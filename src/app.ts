import { App, LogLevel } from '@slack/bolt';
import _ from 'lodash';
import * as Middleware from './middleware';

export default async function main() {
    // Initializes your app with your bot token and signing secret
    const app = new App({
        token: process.env.SLACK_BOT_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        logLevel: LogLevel.DEBUG,
    });

    // listen to every messages that starts with a whole word
    // note: this effectively listen to everything, which will be CPU intensive
    app.message(
        RegExp('^w+'),
        Middleware.contextChannelMembers,
        Middleware.contextMessageTime,
        async ({ context, say, body, message }) => {
            if (message.text && message.text === 'echo debug') {
                console.log(JSON.stringify({ context, body, message }));
                await say(`Context:\n${JSON.stringify({ context, body, message })}`);
            }
        },
    );

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

    app.error(async (error) => {
        //todo: Check the details of the error to handle cases where you should retry sending a message or stop the app
        console.error(error);
    });

    (async () => {
        // start the app
        await app.start(process.env.PORT || 3000);

        console.log('⚡️ Slack app is running!');
    })();
}
