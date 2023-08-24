import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import { ClientService } from '../client.service';
import { Client } from 'src/global/entity/client.entity';

@Injectable()
export class ClientStrategy extends PassportStrategy(BasicStrategy, 'client') {
    constructor(private readonly clientService: ClientService) {
        super();
    }

    async validate(id: string, secret: string): Promise<Client> {
        const client = await this.clientService.validateClient(id, secret);
        if (!client) throw new UnauthorizedException('Invalid client');
        return client;
    }
}
