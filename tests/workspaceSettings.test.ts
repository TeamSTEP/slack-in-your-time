import { initWorkspaceSettings, getWorkspaceSettings } from '../src/service/workspaceSettings';
import { loadEnv } from '../src/config/env';

describe('workspace settings', () => {
    beforeEach(() => {
        process.env.SLACK_SIGNING_SECRET = 'test-secret';
        process.env.SLACK_CLIENT_ID = 'test-client';
        process.env.SLACK_BOT_TOKEN = 'test-token';
    });

    it('should use env default visibility in single-workspace mode', async () => {
        process.env.CONVERSION_MESSAGE_VISIBILITY = 'ephemeral';
        const env = loadEnv();
        initWorkspaceSettings(null, env);

        const settings = await getWorkspaceSettings('T123');

        expect(settings.conversionVisibility).toEqual('ephemeral');
    });

    it('should default to public visibility when env is unset', async () => {
        delete process.env.CONVERSION_MESSAGE_VISIBILITY;
        const env = loadEnv();
        initWorkspaceSettings(null, env);

        const settings = await getWorkspaceSettings('T123');

        expect(settings.conversionVisibility).toEqual('public');
    });
});
