import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configservice: ConfigService) => ({
                transport: {
                    host: configservice.get<string>('EMAIL_HOST'),
                    port: configservice.get<number>('EMAIL_PORT'),
                    secure: false,
                    auth: {
                        user: configservice.get<string>('EMAIL_USER'),
                        pass: configservice.get<string>('EMAIL_PASSWORD'),
                    },
                },
                defaults: {
                    from: '"no-reply" <email address>',
                },
                tls: {
                    rejectUnauthorized: false,
                },
            }),
        }),
    ],
    providers: [MailerModule],
})
export class NodeMailerConfigModule {}
