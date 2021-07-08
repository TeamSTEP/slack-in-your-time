import { Users } from '../model';
import moment from 'moment-timezone';

interface HomeBlockProps {
    userInfo: Users.User;
}

export const appHomeBlock = (props: HomeBlockProps) => {
    const timezone = props.userInfo.tz || moment.tz.guess();

    const time = moment.tz(Date.now(), timezone);
    // todo: make the app home block content be more useful
    return [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: 'Slack In Your Time Home',
            },
        },
        {
            type: 'section',
            text: {
                type: 'plain_text',
                text: `Your local time is ${time.toString()}.`,
                emoji: true,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'This application is still working in progress. If you encounter any issues, please consider opening a bug report in Github.\nThank you for your support!',
            },
            accessory: {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: 'Open Bug Report',
                    emoji: true,
                },
                style: 'danger',
                value: 'clicked_open_issue',
                url: 'https://github.com/TeamSTEP/slack-in-your-time/issues/new',
                action_id: 'btn-issue-action',
            },
        },
    ];
};
