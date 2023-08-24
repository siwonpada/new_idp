import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { IdpModule } from 'src/idp/idp.module';

@Module({
    imports: [HttpModule, ConfigModule, IdpModule],
    controllers: [ClientController],
    providers: [ClientService],
})
export class ClientModule {}
