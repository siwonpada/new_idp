import { Module } from '@nestjs/common';
import { IdpController } from './idp.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { IdpService } from './idp.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { IdpStrategy } from './strategy/idp.strategy';
import { IdpGuard } from './guard/idp.guard';

@Module({
    imports: [
        UserModule,
        ConfigModule,
        CacheModule.register(),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRE'),
                    algorithm: 'HS256',
                    audience: configService.get<string>('JWT_AUDIENCE'),
                    issuer: configService.get<string>('JWT_ISSUER'),
                },
            }),
        }),
    ],
    controllers: [IdpController],
    providers: [IdpService, IdpStrategy, IdpGuard],
    exports: [IdpGuard],
})
export class IdpModule {}
