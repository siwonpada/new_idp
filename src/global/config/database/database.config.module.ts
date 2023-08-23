import { Client } from '@global/entity/client.entity';
import { Consent } from '@global/entity/consent.entity';
import { RefreshToken } from '@global/entity/refreshToken.entity';
import { User } from '@global/entity/user.entity';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get<string>('MYSQL_DATABASE_HOST'),
                port: configService.get<number>('MYSQL_DATABASE_PORT'),
                username: configService.get<string>('MYSQL_DATABASE_USERNAME'),
                password: configService.get<string>('MYSQL_DATABASE_PASSWORD'),
                database: configService.get<string>('MYSQL_DATABASE_NAME'),
                entities: [User, Client, Consent, RefreshToken],
                synchronize: true,
            }),
        }),
    ],
})
export class DatabaseConfigModule {}
