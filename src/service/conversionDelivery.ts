import * as Helpers from '../helper';
import * as Views from '../view';
import { ConversionVisibility } from './workspaceSettings';
import { EventContext, Users } from '../model';
import { buildConversionGroups, getMemberConversionTimes, type TimezoneMemberGroup } from '../helper/memberTimezones';
import type { SayFn } from '@slack/bolt';

type SlackBlocks = ReturnType<typeof Views.convertedTimesBlock>;
type SlackClient = Helpers.SlackWebClient;

interface DeliveryContext {
    client: SlackClient;
    channel: string;
    triggerUserId: string;
    token: string;
    timeContext: EventContext.MessageTimeContext;
    members: Users.User[];
    sourceTimezone: string;
    groups: TimezoneMemberGroup[];
    blocks: SlackBlocks;
    say?: SayFn;
    respond?: (message: Record<string, unknown>) => Promise<unknown>;
}

const deliverPerMember = async (ctx: DeliveryContext): Promise<void> => {
    const recipients = ctx.members.filter((member) => getMemberConversionTimes(ctx.timeContext, member) !== null);

    await Promise.all(
        recipients.map(async (member) => {
            const times = getMemberConversionTimes(ctx.timeContext, member);
            if (!times) return;

            const blocks = Views.personalConversionBlock(ctx.timeContext, member, times);

            await Helpers.sendEphemeralMessage(ctx.client, {
                text: 'Your local time conversion',
                blocks,
                channel: ctx.channel,
                user: member.id,
                token: ctx.token,
            });
        }),
    );
};

export const deliverConversion = async (visibility: ConversionVisibility, ctx: DeliveryContext): Promise<void> => {
    const message = { text: 'time conversion message', blocks: ctx.blocks };

    if (visibility === 'per_member') {
        await deliverPerMember(ctx);
        return;
    }

    if (visibility === 'ephemeral') {
        await Helpers.sendEphemeralMessage(ctx.client, {
            ...message,
            channel: ctx.channel,
            user: ctx.triggerUserId,
            token: ctx.token,
        });
        return;
    }

    if (ctx.say) {
        await ctx.say(message);
        return;
    }

    if (ctx.respond) {
        await ctx.respond({ ...message, response_type: 'in_channel' });
    }
};

export const prepareChannelConversion = (
    timeContext: EventContext.MessageTimeContext,
    members: Users.User[],
): { sourceTimezone: string; groups: TimezoneMemberGroup[]; blocks: SlackBlocks } | null => {
    const groups = buildConversionGroups(timeContext, members);
    if (groups.length === 0) return null;

    const sourceTimezone = timeContext.content[0].tz;

    return {
        sourceTimezone,
        groups,
        blocks: Views.convertedTimesBlock(sourceTimezone, groups),
    };
};
