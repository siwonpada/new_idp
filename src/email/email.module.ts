import { Module } from '@nestjs/common';
import { NodeMailerConfigModule } from '@global/config/mailer/node-mailer.config';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';

@Module({
    imports: [NodeMailerConfigModule, ConfigModule],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}
