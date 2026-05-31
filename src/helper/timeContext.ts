import { webApi } from '@slack/bolt';
import { Users, EventContext } from '../model';
import { parseTimeReference } from './parseTextTime';
import { resolveTimezone } from './timezone';

export const createMessageTimeContext = async (
    client: webApi.WebClient,
    token: string | undefined,
    userId: string,
    channelId: string,
    text: string,
    sentTime: number,
): Promise<EventContext.MessageTimeContext | null> => {
    const userInfo = (await client.users.info({
        token,
        user: userId,
        include_locale: true,
    })) as Users.InfoResponse;

    const senderTimezone = resolveTimezone(userInfo.user.tz);
    const parsedTime = parseTimeReference(text, sentTime, senderTimezone);

    if (!parsedTime || parsedTime.length < 1) return null;

    return {
        senderId: userId,
        sentChannel: channelId,
        content: parsedTime,
        sentTime,
    };
};
