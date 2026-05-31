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
            text: { type: 'plain_text' as const, text: 'Public — post conversions in the channel' },
            value: 'public',
        },
        {
            text: { type: 'plain_text' as const, text: 'Ephemeral — only visible to the person who triggered it' },
            value: 'ephemeral',
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
                      text: '*Workspace settings*\nChoose how converted times are posted after confirmation or direct conversion.',
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
          ]
        : [
              {
                  type: 'context' as const,
                  elements: [
                      {
                          type: 'mrkdwn' as const,
                          text: `Conversion messages are set to *${props.settings.conversionVisibility}* via server configuration.`,
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
