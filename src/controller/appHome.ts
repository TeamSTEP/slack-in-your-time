import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';

const homeHeaderBlock = (userId: string) => {
    return [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: 'Slack in Your Time',
                emoji: true,
            },
        },
        {
            type: 'image',
            image_url:
                'https://user-images.githubusercontent.com/40356749/98464707-0a21c480-2208-11eb-84dc-4e74b7b9c62a.png',
            alt_text: 'app-icon',
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `Hello <@${userId}>, thank you for using *Slack In Your Time*: a simple application for teams working around the world!
                This application is still under heavy development, so please note that not everything will work as expected.`,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'If you like this application, consider supporting the developer by becoming a Patron!',
            },
            accessory: {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: 'Support',
                    emoji: true,
                },
                value: 'none',
                url: 'https://www.patreon.com/teamstep',
                action_id: 'button-action',
            },
        },
        {
            type: 'divider',
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'Time converter tool',
            },
        },
        {
            type: 'actions',
            elements: [
                {
                    type: 'datepicker',
                    initial_date: '1990-04-28',
                    placeholder: {
                        type: 'plain_text',
                        text: 'Date',
                        emoji: true,
                    },
                    action_id: 'datepicker-action',
                },
                {
                    type: 'timepicker',
                    initial_time: '13:37',
                    placeholder: {
                        type: 'plain_text',
                        text: 'Select time',
                        emoji: true,
                    },
                    action_id: 'timepicker-action',
                },
                {
                    type: 'static_select',
                    placeholder: {
                        type: 'plain_text',
                        text: 'Time Zone',
                        emoji: true,
                    },
                    options: [
                        {
                            text: {
                                type: 'plain_text',
                                text: 'JST (UTC+9:00)',
                                emoji: true,
                            },
                            value: 'value-0',
                        },
                        {
                            text: {
                                type: 'plain_text',
                                text: 'MST (UTC-07:00)',
                                emoji: true,
                            },
                            value: 'value-1',
                        },
                        {
                            text: {
                                type: 'plain_text',
                                text: 'AFT (UTC+04:30)',
                                emoji: true,
                            },
                            value: 'value-2',
                        },
                    ],
                    action_id: 'static_select-input',
                },
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'Send converted time',
                        emoji: true,
                    },
                    value: 'click_me_123',
                    style: 'primary',
                    action_id: 'actionId-1',
                },
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'Cancel',
                        emoji: true,
                    },
                    value: 'click_me_123',
                    style: 'danger',
                    action_id: 'actionId-2',
                },
            ],
        },
    ];
};

export const displayAppHomeTab: Middleware<SlackEventMiddlewareArgs<'app_home_opened'>> = async ({ client, event }) => {
    try {
        const userId = event.user;
        const headerBlock = homeHeaderBlock(userId);

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
