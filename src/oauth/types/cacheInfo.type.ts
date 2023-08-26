import { Scope } from '../oauth.service';

export type CacheInfo = {
    userUuid: string;
    clientId: string;
    nonce: string;
    redirectUri: string;
    scope: Scope[];
};
