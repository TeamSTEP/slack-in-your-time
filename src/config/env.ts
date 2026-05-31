import { z } from 'zod';

const envSchema = z.object({
    SLACK_SIGNING_SECRET: z.string().min(1),
    SLACK_CLIENT_ID: z.string().min(1),
    SLACK_CLIENT_SECRET: z.string().optional(),
    SLACK_BOT_TOKEN: z.string().optional(),
    PORT: z.coerce.number().int().positive().default(3000),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
    FIREBASE_PROJECT_ID: z.string().default('slack-in-your-time'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
    CONVERSION_MESSAGE_VISIBILITY: z.enum(['public', 'ephemeral', 'per_member']).default('public'),
    AUTO_CONVERT: z
        .enum(['true', 'false'])
        .default('false')
        .transform((value) => value === 'true'),
});

export type Env = z.infer<typeof envSchema>;

export const loadEnv = (): Env => {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        const details = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
        throw new Error(`Invalid environment configuration: ${details}`);
    }

    return result.data;
};

export const isOAuthMode = (env: Env): boolean => !env.SLACK_BOT_TOKEN;
