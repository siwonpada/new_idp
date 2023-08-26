import { User } from '@global/entity/user.entity';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Scope } from './oauth.service';
import { Consent } from '@global/entity/consent.entity';
import { Client } from '@global/entity/client.entity';
import { RefreshToken } from '@global/entity/refreshToken.entity';

const MAX_REFRESH_TOKENS = 10;

@Injectable()
export class OauthRepository {
    constructor(private readonly entityManager: EntityManager) {}

    async updateUserConsent(
        user: User,
        scope: Readonly<Scope[]>,
        clientId: string,
    ) {
        const userConsent = this.entityManager.create(Consent, {
            user,
            scopes: [...scope],
            client: await this.entityManager.findOne(Client, {
                where: { id: clientId },
            }),
        });
        return this.entityManager.upsert(Consent, userConsent, {
            conflictPaths: { client: true, user: true },
        });
    }

    async updateOauthRefreshToken({
        user,
        clientId,
        token,
        scopes,
    }: {
        user: User;
        clientId: string;
        token: string;
        scopes: Readonly<Scope[]>;
    }) {
        const consent = await this.entityManager.findOne(Consent, {
            where: {
                user: { userUuid: user.userUuid },
                client: { id: clientId },
            },
        });
        if (!consent) {
            throw new Error('Consent not found');
        }
        const refreshToken = this.entityManager.create(RefreshToken, {
            consent,
            token,
            scopes: [...scopes],
            updatedAt: new Date(),
        });
        await this.entityManager.upsert(RefreshToken, refreshToken, {
            conflictPaths: ['consent.clientUuid', 'consent.userUuid'],
        });
        const refreshTokens = (await consent.refreshTokens).sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );
        consent.refreshTokens = refreshTokens
            .filter(
                ({ updatedAt }) =>
                    updatedAt.getTime() >
                    Date.now() - 1000 * 60 * 60 * 24 * 30 * 6,
            )
            .slice(Math.max(0, refreshTokens.length - MAX_REFRESH_TOKENS));
        await this.entityManager.save(consent);
    }

    async findRefreshToken(token: string): Promise<RefreshToken | undefined> {
        return this.entityManager.findOne(RefreshToken, {
            where: { token },
        });
    }

    async deleteRefreshToken(token: string, clientId: string) {
        const refreshToken = await this.entityManager.findOne(RefreshToken, {
            where: {
                token,
                consent: { client: { id: clientId } },
            },
        });
        if (token) await this.entityManager.remove(refreshToken);
    }
}
