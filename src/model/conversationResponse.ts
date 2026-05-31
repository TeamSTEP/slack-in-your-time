import { webApi } from '@slack/bolt';

export interface MembersResponse extends webApi.WebAPICallResult {
    members: string[];
}
