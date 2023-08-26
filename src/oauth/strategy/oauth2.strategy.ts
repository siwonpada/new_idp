import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-auth-token';
import { OauthService } from '../oauth.service';

@Injectable()
export class Oauth2Strategy extends PassportStrategy(Strategy, 'oauth2') {
    constructor(private readonly oauthService: OauthService) {
        super({
            tokenFields: ['access_token'],
            headerFields: ['Authorization'],
        });
    }

    async validate(token: string) {
        token = token.replace('Bearer ', '');
        if (!token) throw new UnauthorizedException('Invalid token');
        return this.oauthService.validateToken(token);
    }
}
