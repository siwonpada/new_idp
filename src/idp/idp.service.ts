import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { LoginInfoDto } from './dto/req/loginInfo.dto';
import { LoginResult } from './types/login-redirection.type';
import { UserService } from 'src/user/user.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class IdpService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
    ) {}

    async login({
        userEmailId,
        userPassword,
    }: LoginInfoDto): Promise<LoginResult> {
        const user = await this.userService.validateUserPassword({
            userEmailId,
            userPassword,
        });

        const refreshToken = this.generateOpaqueToken();
        this.cache.set(
            refreshToken,
            { userUuid: user.userUuid },
            60 * 60 * 24 * 30 * 6,
        );

        return {
            accessToken: this.jwtService.sign(
                {},
                {
                    subject: user.userUuid,
                },
            ),
            refreshToken,
        };
    }

    private generateOpaqueToken() {
        return crypto
            .randomBytes(32)
            .toString('base64')
            .replace(/[+\/=]/g, '');
    }
}
