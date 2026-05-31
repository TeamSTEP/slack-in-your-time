import type { CustomRoute } from '@slack/bolt';

export const healthRoute: CustomRoute = {
    path: '/health',
    method: 'GET',
    handler: (_req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
    },
};
