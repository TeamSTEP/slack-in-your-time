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
        delete process.env.AUTO_CONVERT;
        const env = loadEnv();
        initWorkspaceSettings(null, env);

        const settings = await getWorkspaceSettings('T123');

        expect(settings.conversionVisibility).toEqual('ephemeral');
        expect(settings.autoConvert).toEqual(false);
    });

    it('should support per_member visibility from env', async () => {
        process.env.CONVERSION_MESSAGE_VISIBILITY = 'per_member';
        const env = loadEnv();
        initWorkspaceSettings(null, env);

        const settings = await getWorkspaceSettings('T123');

        expect(settings.conversionVisibility).toEqual('per_member');
    });

    it('should read auto-convert from env', async () => {
        process.env.AUTO_CONVERT = 'true';
        const env = loadEnv();
        initWorkspaceSettings(null, env);

        const settings = await getWorkspaceSettings('T123');

        expect(settings.autoConvert).toEqual(true);
    });

    it('should default to public visibility and no auto-convert when env is unset', async () => {
        delete process.env.CONVERSION_MESSAGE_VISIBILITY;
        delete process.env.AUTO_CONVERT;
        const env = loadEnv();
        initWorkspaceSettings(null, env);

        const settings = await getWorkspaceSettings('T123');

        expect(settings.conversionVisibility).toEqual('public');
        expect(settings.autoConvert).toEqual(false);
    });
});
