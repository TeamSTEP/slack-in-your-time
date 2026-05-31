import { DateTime } from 'luxon';
import { Users } from '../model';
import { getLocalTimezone } from '../helper/timezone';
import type { WorkspaceSettings } from '../service/workspaceSettings';

interface HomeBlockProps {
    userInfo: Users.User;
    settings: WorkspaceSettings;
    settingsEditable: boolean;
}

export const appHomeBlock = (props: HomeBlockProps) => {
    const timezone = props.userInfo.tz || getLocalTimezone();
    const time = DateTime.now().setZone(timezone);

    const visibilityOptions = [
        {
            text: { type: 'plain_text' as const, text: 'Public — post in channel' },
            value: 'public',
        },
        {
            text: { type: 'plain_text' as const, text: 'Ephemeral — only the triggerer sees it' },
            value: 'ephemeral',
        },
        {
            text: { type: 'plain_text' as const, text: 'Per member — each person gets their local time privately' },
            value: 'per_member',
        },
    ];

    const autoConvertOptions = [
        {
            text: { type: 'plain_text' as const, text: 'Ask before converting' },
            value: 'false',
        },
        {
            text: { type: 'plain_text' as const, text: 'Convert automatically' },
            value: 'true',
        },
    ];

    const settingsBlocks = props.settingsEditable
        ? [
              {
                  type: 'divider' as const,
              },
              {
                  type: 'section' as const,
                  text: {
                      type: 'mrkdwn' as const,
                      text: '*Workspace settings*\nControl how time conversions are delivered in channels.',
                  },
              },
              {
                  type: 'section' as const,
                  block_id: 'conversion_visibility',
                  text: {
                      type: 'mrkdwn' as const,
                      text: '*Conversion visibility*',
                  },
                  accessory: {
                      type: 'static_select' as const,
                      action_id: 'set_conversion_visibility',
                      placeholder: {
                          type: 'plain_text' as const,
                          text: 'Conversion visibility',
                      },
                      initial_option: visibilityOptions.find(
                          (option) => option.value === props.settings.conversionVisibility,
                      ),
                      options: visibilityOptions,
                  },
              },
              {
                  type: 'section' as const,
                  block_id: 'auto_convert',
                  text: {
                      type: 'mrkdwn' as const,
                      text: '*Channel messages*\nWhen someone mentions a time, should the bot convert immediately or ask first?',
                  },
                  accessory: {
                      type: 'static_select' as const,
                      action_id: 'set_auto_convert',
                      placeholder: {
                          type: 'plain_text' as const,
                          text: 'Auto-convert behavior',
                      },
                      initial_option: autoConvertOptions.find(
                          (option) => option.value === String(props.settings.autoConvert),
                      ),
                      options: autoConvertOptions,
                  },
              },
          ]
        : [
              {
                  type: 'context' as const,
                  elements: [
                      {
                          type: 'mrkdwn' as const,
                          text: `Settings: visibility *${props.settings.conversionVisibility}*, auto-convert *${props.settings.autoConvert ? 'on' : 'off'}* (via server configuration).`,
                      },
                  ],
              },
          ];

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
        ...settingsBlocks,
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: '*Quick tips*\n• Mention me with a time: `@Slack In Your Time meeting at 3pm EST`\n• Use `/convert 3pm tomorrow` for direct conversion\n• Include a timezone in your message to override your profile zone',
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'Found a bug? Please open an issue on GitHub.',
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
