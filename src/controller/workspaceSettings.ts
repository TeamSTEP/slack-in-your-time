import { Middleware, SlackActionMiddlewareArgs, BlockAction, StaticSelectAction } from '@slack/bolt';
import { getLogger } from '../config';
import {
    getWorkspaceSettings,
    saveWorkspaceSettings,
    ConversionVisibility,
    isSettingsEditable,
} from '../service/workspaceSettings';
import * as View from '../view';
import { Users } from '../model';

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
    } catch (err) {
        getLogger().error({ err }, 'Failed to update conversion visibility setting');
    }
};
