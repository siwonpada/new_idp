import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { IdpModule } from 'src/idp/idp.module';
import { ClientStrategy } from './strategy/client.strategy';
import { ClientGuard } from './guard/client.guard';
import { ClientRepository } from './client.repository';

@Module({
    imports: [HttpModule, ConfigModule, IdpModule],
    controllers: [ClientController],
    providers: [ClientService, ClientRepository, ClientStrategy, ClientGuard],
    exports: [ClientService, ClientGuard],
})
export class ClientModule {}
