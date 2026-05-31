# Slack In Your Time

![banner](https://user-images.githubusercontent.com/40356749/121809381-86492280-cc97-11eb-9848-c4cdeb0c5f18.jpg)

> This app is still under heavy development.
> Expect a lot of changes to happen before it's officially published to Slack.

[![install-button](https://platform.slack-edge.com/img/add_to_slack.png)](https://siyt-app.teamstep.io/slack/install)

## Introduction

Are you part of a multi-national team who only works across the internet?
Or are you the British Empire and your sun is never setting?

Either way, if you have worked in a team with more than two time zones, you've definitely had a situation where someone wanted to have a meeting with you at 5, but you misunderstood when 5 actually was on your area!
As more and more people work through the internet with strangers from across the globe, this will be a common issue.
Until everyone is used to using Unix epoch time, we'll have to do something about it.

That is why we decided to make this Slack app.

## Features

![bot-test-img](https://user-images.githubusercontent.com/40356749/124895038-3ab33b80-dfed-11eb-998c-612f3b882c42.jpg)

This application is powered by [chrono](https://github.com/wanasit/chrono) for natural-language date parsing and [bolt-js](https://github.com/SlackAPI/bolt-js) for Slack integration.

Once installed, the bot listens for time references in channel messages and helps convert them across members' timezones.

### Automatic channel detection

When someone posts a message containing a time reference, the bot prompts the sender to convert it — unless auto-convert is enabled in workspace settings.

### Direct conversion

- **App mention**: `@Slack In Your Time meeting at 3pm EST`
- **Slash command**: `/convert 3pm tomorrow`

### In-text timezone override

Include an IANA label (`America/New_York`) or abbreviation (`EST`, `JST`) in your message to parse the time in that zone instead of your Slack profile timezone.

### Configurable delivery

Workspace admins can configure how conversions are delivered (App Home tab):

| Mode | Behavior |
|------|----------|
| **Public** | Post converted times in the channel |
| **Ephemeral** | Only the person who triggered the conversion sees it |
| **Per member** | Each channel member receives a private message with their local time |

Auto-convert can also be toggled to skip the confirmation prompt on channel messages.

## Self-hosting

```bash
cp .env.sample .env
# Fill in Slack credentials; for multi-workspace OAuth, add Firebase credentials to secrets/

docker compose up -d --build
```

See `.env.sample` for all configuration options including `CONVERSION_MESSAGE_VISIBILITY` and `AUTO_CONVERT` for single-workspace deployments.

## Development

```bash
yarn install
yarn dev
yarn test
yarn build
```

Requires Node 22+.

## Future Plans

- [x] Add in-text timezone overriding
- [x] Add direct time conversion via App Mentioning or Slash Commands
- [x] Add configurable messaging
- [x] Per-member private delivery and member-aware conversion output
