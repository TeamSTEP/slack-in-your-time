import { loadEnv, isOAuthMode } from '../src/config/env';

describe('loadEnv', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should require Slack signing credentials', () => {
        delete process.env.SLACK_SIGNING_SECRET;
        process.env.SLACK_CLIENT_ID = 'client-id';

        expect(() => loadEnv()).toThrow('Invalid environment configuration');
    });

    it('should parse defaults for optional values', () => {
        process.env.SLACK_SIGNING_SECRET = 'secret';
        process.env.SLACK_CLIENT_ID = 'client-id';
        process.env.NODE_ENV = 'test';

        const env = loadEnv();

        expect(env.PORT).toEqual(3000);
        expect(env.FIREBASE_PROJECT_ID).toEqual('slack-in-your-time');
        expect(isOAuthMode(env)).toBe(true);
    });

    it('should detect single-workspace mode when SLACK_BOT_TOKEN is set', () => {
        process.env.SLACK_SIGNING_SECRET = 'secret';
        process.env.SLACK_CLIENT_ID = 'client-id';
        process.env.SLACK_BOT_TOKEN = 'xoxb-test';
        process.env.NODE_ENV = 'test';

        expect(isOAuthMode(loadEnv())).toBe(false);
    });
});
