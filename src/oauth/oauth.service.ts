import {
    BadRequestException,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthorizeDTO } from './dto/req/authorize.dto';
import { User } from '@global/entity/user.entity';
import { ClientService } from 'src/client/client.service';
import * as crypto from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '@global/types/user.type';
import { TokenDTO } from './dto/req/token.dto';
import { Client } from '@global/entity/client.entity';
import { CacheInfo } from './types/cacheInfo.type';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { OauthRepository } from './oauth.repository';

const scopesRequireConsent = [
    'profile',
    'email',
    'phone',
    'student_id',
] as const;
export const allowedScopes = [
    'openid',
    'offline_access',
    ...scopesRequireConsent,
] as const;
export type Scope = (typeof allowedScopes)[number];

@Injectable()
export class OauthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly clientService: ClientService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly oauthRepository: OauthRepository,
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
    ) {}

    certs() {
        return {
            keys: [this.cert()],
        };
    }

    async authorize(
        { clientId, redirectUri, nonce, scope, responseType }: AuthorizeDTO,
        user: User,
    ): Promise<
        Partial<{
            code: string;
            accessToken: string;
            tokenType: string;
            expiresIn: number;
            scope: string;
            idToken: string;
            refreshToken: string;
        }>
    > {
        if (!(await this.clientService.validateUri(clientId, redirectUri)))
            throw new UnauthorizedException('unauthorized_client');

        const code = responseType.includes('code')
            ? await (async () => {
                  const code = this.generateOpaqueToken();
                  await this.cache.set(
                      code,
                      {
                          userUuid: user.userUuid,
                          clientId,
                          nonce,
                          redirectUri,
                          scope,
                      },
                      300,
                  );
                  return code;
              })()
            : undefined;

        if (
            responseType.includes('token') ||
            responseType.includes('id_token')
        ) {
            if (responseType.includes('id_token') && !nonce)
                throw new BadRequestException('invalid_request');
            if (!responseType.includes('id_token') && nonce)
                throw new BadRequestException('invalid_request');
            return this.createToken({
                user,
                clientId,
                scope,
                nonce,
                excludeAccessToken: !responseType.includes('token'),
                excludeScope:
                    !responseType.includes('code') &&
                    !responseType.includes('token'),
                excludeIdToken: !responseType.includes('id_token'),
                code,
            });
        }

        return {
            code,
        };
    }

    async token(
        { code, redirectUri, grantType, refreshToken, ...dto }: TokenDTO,
        client?: Client,
    ): Promise<any> {
        const clientId = client === undefined ? dto.clientId : client.id;
        if (
            dto.clientId &&
            dto.clientSecret &&
            !(await this.clientService.validateClient(
                dto.clientId,
                dto.clientSecret,
            ))
        )
            throw new BadRequestException('unauthorized_client');

        if (grantType === 'authorization_code') {
            if (!code) throw new BadRequestException('invalid_request');
            return this.generateAccessToken({
                code,
                redirectUri,
                clientId,
            });
        }

        if (!refreshToken) throw new BadRequestException('invalid_request');
        const refreshTokenFromDB = await this.oauthRepository.findRefreshToken(
            refreshToken,
        );
        if (!refreshTokenFromDB) throw new BadRequestException('invalid_grant');
        await this.oauthRepository.updateOauthRefreshToken({
            user: refreshTokenFromDB.consent.user,
            clientId,
            token: refreshTokenFromDB.token,
            scopes: refreshTokenFromDB.scopes,
        });
        return this.createToken({
            scope: refreshTokenFromDB.scopes,
            clientId,
            user: refreshTokenFromDB.consent.user,
            excludeIdToken: true,
        });
    }

    async revoke(revokeDTO: any, client?: Client): Promise<void> {
        const clientId = client === undefined ? revokeDTO.clientId : client.id;
        if (
            revokeDTO.clientId &&
            revokeDTO.clientSecret &&
            !(await this.clientService.validateClient(
                revokeDTO.clientId,
                revokeDTO.clientSecret,
            ))
        )
            throw new BadRequestException('unauthorized_client');

        if (revokeDTO.token_type_hint === 'access_token') {
            await this.revokeAccessToken(revokeDTO.token, clientId);
            return;
        }
        if (revokeDTO.token_type_hint === 'refresh_token') {
            await this.revokeRefreshToken(revokeDTO.token, clientId);
            return;
        }
        if (!(await this.revokeAccessToken(revokeDTO.token, clientId))) {
            await this.revokeRefreshToken(revokeDTO.token, clientId);
        }
    }

    async validateToken(
        token: string,
    ): Promise<Omit<UserType, 'userPassword' | 'accessLevel'>> {
        const cacheInfo: CacheInfo = await this.cache.get(token);
        if (cacheInfo) {
            const user = await this.userService.findUserByUuid({
                userUuid: cacheInfo.userUuid,
            });
            return this.filterScopes(cacheInfo.scope, user);
        }
        const jwt: JwtPayload = this.jwtService.verify(token).catch(() => {
            throw new UnauthorizedException('invalid_token');
        });
        return {
            userUuid: jwt.sub,
            userName: jwt.name,
            userEmailId: jwt.email,
            userPhoneNumber: jwt.phoneNumber,
            studentId: jwt.studentId,
        };
    }

    private cert() {
        const sk = crypto.createPrivateKey(
            this.configService.get<string>('JWT_PRIVATE_KEY'),
        );
        const pk = crypto.createPublicKey(sk);
        const kid = (() => {
            const shasum = crypto.createHash('sha1');
            shasum.update(pk.export({ format: 'der', type: 'spki' }));
            return shasum.digest('hex');
        })();
        return {
            ...pk.export({ format: 'jwk' }),
            kid,
            use: 'sig',
            alg: 'ES256',
        };
    }

    private async createToken({
        user,
        clientId,
        nonce,
        scope,
        excludeAccessToken,
        excludeScope,
        excludeIdToken,
        includeRefreshToken,
        code,
    }: {
        user: User;
        clientId: string;
        nonce?: string;
        scope: Readonly<Scope[]>;
        excludeAccessToken?: boolean;
        excludeScope?: boolean;
        excludeIdToken?: boolean;
        includeRefreshToken?: boolean;
        code?: string;
    }): Promise<
        Partial<{
            code: string;
            accessToken: string;
            tokenType: string;
            expiresIn: number;
            scope: string;
            idToken: string;
            refreshToken: string;
        }>
    > {
        const filteredUser = this.filterScopes(scope, user);
        await this.oauthRepository.updateUserConsent(
            user,
            scope.filter((s) =>
                (scopesRequireConsent as Readonly<string[]>).includes(s),
            ),
            clientId,
        );
        return {
            code,
            ...(excludeAccessToken
                ? {}
                : {
                      accessToken: await (async () => {
                          const token = this.generateOpaqueToken();
                          await this.cache.set(
                              token,
                              { userUuid: user.userUuid, scope, clientId },
                              60 * 60,
                          );
                          return token;
                      })(),
                      tokenType: 'Bearer',
                      expiresIn: 3600,
                  }),
            scope: excludeScope ? undefined : scope.join(' '),
            idToken: excludeIdToken
                ? undefined
                : this.jwtService.sign(
                      {
                          nonce,
                          ...filteredUser,
                      },
                      {
                          subject: user.userUuid,
                          audience: clientId,
                      },
                  ),
            refreshToken: includeRefreshToken
                ? await (async () => {
                      const token = this.generateOpaqueToken();
                      this.oauthRepository.updateOauthRefreshToken({
                          user,
                          clientId,
                          token,
                          scopes: scope,
                      });
                      return token;
                  })()
                : undefined,
        };
    }

    private async generateAccessToken({
        code,
        redirectUri,
        clientId,
    }: {
        code: string;
        redirectUri: string;
        clientId: string;
    }): Promise<CacheInfo & { includeRefreshToken: boolean }> {
        const cacheInfo: CacheInfo = await this.cache.get(code);
        if (!cacheInfo) throw new BadRequestException('invalid_grant');
        await this.cache.del(code);
        if (redirectUri !== cacheInfo.redirectUri)
            throw new BadRequestException('invalid_grant');
        if (clientId !== cacheInfo.clientId)
            throw new BadRequestException('invalid_grant');
        return {
            ...cacheInfo,
            clientId,
            includeRefreshToken: cacheInfo.scope.includes('offline_access'),
        };
    }

    private async revokeAccessToken(
        token: string,
        clientId: string,
    ): Promise<boolean> {
        const cacheInfo: CacheInfo = await this.cache.get(token);
        if (!cacheInfo) return false;
        if (clientId !== cacheInfo.clientId) return false;
        await this.cache.del(token);
        return true;
    }

    private async revokeRefreshToken(
        token: string,
        clientId: string,
    ): Promise<boolean> {
        //TODO: implement refresh token
        await this.oauthRepository.deleteRefreshToken(token, clientId);
        return true;
    }

    private filterScopes(
        scopes: Readonly<Scope[]> = allowedScopes,
        user: User,
    ): Omit<UserType, 'userPassword' | 'accessLevel'> {
        return {
            userEmailId: scopes.includes('email')
                ? user.userEmailId
                : undefined,
            userName: scopes.includes('profile') ? user.userName : undefined,
            studentId: scopes.includes('student_id')
                ? user.studentId
                : undefined,
            userPhoneNumber: scopes.includes('phone')
                ? user.userPhoneNumber
                : undefined,
            userUuid: user.userUuid,
        };
    }

    private generateOpaqueToken(): string {
        return crypto
            .randomBytes(32)
            .toString('base64')
            .replace(/[+\/=]/g, '');
    }

    discovery(): any {
        const baseUrl = 'https://api.idp.gistory.me';
        return {
            issuer: 'https://idp.gistory.me',
            authorization_endpoint: `${baseUrl}/oauth/authorize`,
            token_endpoint: `${baseUrl}/oauth/token`,
            userinfo_endpoint: `${baseUrl}/oauth/userinfo`,
            jwks_uri: `${baseUrl}/oauth/certs`,
            response_types_supported: [
                'code',
                'token',
                'id_token',
                'code token',
                'code id_token',
                'token id_token',
                'code token id_token',
            ],
            subject_types_supported: ['public'],
            id_token_signing_alg_values_supported: ['ES256'],
            scopes_supported: allowedScopes,
            token_endpoint_auth_methods_supported: [
                'client_secret_basic',
                'client_secret_post',
            ],
            claims_supported: [
                'name',
                'email',
                'phone_number',
                'student_id',
                'aud',
                'exp',
                'iat',
                'iss',
                'sub',
            ],
            grant_types_supported: [
                'authorization_code',
                'refresh_token',
                'implicit',
            ],
        };
    }
}
