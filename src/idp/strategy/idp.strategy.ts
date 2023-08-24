import { User } from '@global/entity/user.entity';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class IdpStrategy extends PassportStrategy(Strategy, 'IdP') {
    constructor(
        private readonly userService: UserService,
        configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            issuer: configService.get('JWT_ISSUER'),
            audience: configService.get('JWT_AUDIENCE'),
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload) {
        const user: User = await this.userService
            .findUserByUuid({
                userUuid: payload.sub,
            })
            .catch(() => {
                throw new UnauthorizedException('invalid token');
            });

        return user;
    }
}
