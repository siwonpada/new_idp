import { Module } from '@nestjs/common';
import { OauthController, OpenIDDiscoveryController } from './oauth.controller';
import { OauthService } from './oauth.service';
import { IdpModule } from 'src/idp/idp.module';
import { ClientModule } from 'src/client/client.module';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { UserModule } from 'src/user/user.module';
import { AnonymousStrategy } from './strategy/anonymous.strategy';
import { AnonymousGuard } from './guard/anonymous.guard';
import { OauthRepository } from './oauth.repository';

@Module({
    imports: [
        IdpModule,
        ClientModule,
        UserModule,
        CacheModule.register(),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const sk = crypto.createPrivateKey(
                    configService.get<string>('JWT_PRIVATE_KEY'),
                );
                const pk = crypto.createPublicKey(sk);
                const keyid = (() => {
                    const shasum = crypto.createHash('sha1');
                    shasum.update(pk.export({ type: 'spki', format: 'der' }));
                    return shasum.digest('hex');
                })();
                return {
                    privateKey: sk.export(),
                    publicKey: pk.export(),
                    signOptions: {
                        expiresIn: configService.get<string>('JWT_EXPIRES'),
                        algorithm: 'RS256',
                        issuer: configService.get<string>('JWT_ISSUER'),
                        keyid,
                    },
                };
            },
        }),
    ],
    controllers: [OauthController, OpenIDDiscoveryController],
    providers: [
        OauthService,
        OauthRepository,
        AnonymousStrategy,
        AnonymousGuard,
    ],
})
export class OauthModule {}
