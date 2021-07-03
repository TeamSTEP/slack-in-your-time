import { Users } from '../model';
import moment from 'moment-timezone';

interface HomeBlockProps {
    userId: string;
    userInfo: Users.User;
}

export const appHomeBlock = (props: HomeBlockProps) => {
    const timezone = props.userInfo.tz_label;
    const time = moment(timezone);
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
                text: `Local time <@${props.userId}>: ${time.toString()}`,
            },
        },
    ];
};
