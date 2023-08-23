import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CacheModule } from '@nestjs/cache-manager';
import { EmailModule } from 'src/email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserRepository } from './user.repository';

@Module({
    imports: [
        EmailModule,
        CacheModule.register(),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('CERTIFICATION_JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>(
                        'CERTIFICATION_JWT_EXPIRE',
                    ),
                    algorithm: 'HS256',
                },
            }),
        }),
    ],
    controllers: [UserController],
    providers: [UserService, UserRepository],
})
export class UserModule {}
