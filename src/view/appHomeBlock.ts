interface HomeBlockProps {
    userId: string;
}

export const appHomeBlock = (props: HomeBlockProps) => {
    const today = new Date();
    return [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: 'Slack in Your Time Debugger',
                emoji: true,
            },
        },
        {
            type: 'divider',
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `Local time of <@${props.userId}>: ${today.toString()}`,
            },
        },
        {
            type: 'input',
            element: {
                type: 'static_select',
                placeholder: {
                    type: 'plain_text',
                    text: 'Select an item',
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
                action_id: 'static_select-action',
            },
            label: {
                type: 'plain_text',
                text: 'Sender time zone',
                emoji: true,
            },
        },
        {
            type: 'input',
            element: {
                type: 'plain_text_input',
                multiline: true,
                action_id: 'plain_text_input-action',
            },
            label: {
                type: 'plain_text',
                text: 'Message Input',
                emoji: true,
            },
        },
        {
            type: 'actions',
            elements: [
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'Parse Time',
                        emoji: true,
                    },
                    value: 'click_me_123',
                    style: 'primary',
                    action_id: 'actionId-0',
                },
            ],
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: '*Converted time*:',
            },
            fields: [
                {
                    type: 'plain_text',
                    text: '*this is plain_text text*',
                    emoji: true,
                },
                {
                    type: 'plain_text',
                    text: '*this is plain_text text*',
                    emoji: true,
                },
                {
                    type: 'plain_text',
                    text: '*this is plain_text text*',
                    emoji: true,
                },
                {
                    type: 'plain_text',
                    text: '*this is plain_text text*',
                    emoji: true,
                },
                {
                    type: 'plain_text',
                    text: '*this is plain_text text*',
                    emoji: true,
                },
            ],
        },
    ];
};
