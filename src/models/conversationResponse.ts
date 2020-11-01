import { WebAPICallResult } from '@slack/web-api';

export interface MembersResponse extends WebAPICallResult {
    members: string[];
}
