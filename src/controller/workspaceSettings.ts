import { Middleware, SlackActionMiddlewareArgs, BlockAction, StaticSelectAction, webApi } from '@slack/bolt';
import { getLogger } from '../config';
import {
    getWorkspaceSettings,
    saveWorkspaceSettings,
    ConversionVisibility,
    isSettingsEditable,
} from '../service/workspaceSettings';
import * as View from '../view';
import { Users } from '../model';

const refreshAppHome = async (client: webApi.WebClient, userId: string, teamId: string) => {
    const userInfo = (await client.users.info({ user: userId, include_locale: true })) as Users.InfoResponse;
    const settings = await getWorkspaceSettings(teamId);
    const homeBlock = View.appHomeBlock({
        userInfo: userInfo.user,
        settings,
        settingsEditable: true,
    });

    await client.views.publish({
        user_id: userId,
        view: {
            type: 'home',
            blocks: homeBlock,
        },
    });
};

export const updateConversionVisibility: Middleware<
    SlackActionMiddlewareArgs<BlockAction<StaticSelectAction>>
> = async ({ body, ack, client, action }) => {
    await ack();

    try {
        const teamId = body.team?.id;
        const userId = body.user.id;

        if (!teamId) throw new Error('Team ID not found in action payload');
        if (!isSettingsEditable()) throw new Error('Workspace settings are not editable in this deployment');

        const visibility = action.selected_option.value as ConversionVisibility;
        await saveWorkspaceSettings(teamId, { conversionVisibility: visibility });

        await refreshAppHome(client, userId, teamId);
    } catch (err) {
        getLogger().error({ err }, 'Failed to update conversion visibility setting');
    }
};

export const updateAutoConvert: Middleware<SlackActionMiddlewareArgs<BlockAction<StaticSelectAction>>> = async ({
    body,
    ack,
    client,
    action,
}) => {
    await ack();

    try {
        const teamId = body.team?.id;
        const userId = body.user.id;

        if (!teamId) throw new Error('Team ID not found in action payload');
        if (!isSettingsEditable()) throw new Error('Workspace settings are not editable in this deployment');

        const autoConvert = action.selected_option.value === 'true';
        await saveWorkspaceSettings(teamId, { autoConvert });

        await refreshAppHome(client, userId, teamId);
    } catch (err) {
        getLogger().error({ err }, 'Failed to update auto-convert setting');
    }
};
