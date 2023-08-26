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
import { UserType } from '@global/type/user.type';

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
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
    ) {}

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
        //TODO: implement update Consent
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
                      //TODO: implement refresh token
                      return token;
                  })()
                : undefined,
        };
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

    discovery() {
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
