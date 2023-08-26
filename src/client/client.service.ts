import {
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { ClientRepository } from './client.repository';
import * as bcrypt from 'bcrypt';
import { ClientInfoDto } from './dto/req/clientInfo.dto';
import { ClientCredentialDTO } from './dto/res/clientCredentialRes.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { UpdateClientDTO } from './dto/req/updateClient.dto';
import { Client } from '@global/entity/client.entity';
import { User } from '@global/entity/user.entity';

@Injectable()
export class ClientService {
    constructor(
        private readonly clientRepository: ClientRepository,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    async getClientList(user: User): Promise<Client[]> {
        return user.clients;
    }

    async getClient(uuid: string, user: User): Promise<Client> {
        const client = user.clients.find((client) => client.uuid === uuid);
        if (!client) throw new ForbiddenException('Client not found');
        return client;
    }

    async registerClient(
        { id, name, urls }: ClientInfoDto,
        user: User,
    ): Promise<ClientCredentialDTO> {
        const { secretKey, hashed } = this.generateSecretKey();
        const client = await this.clientRepository.createClient(
            { id, name, password: hashed, urls },
            user,
        );
        return {
            uuid: client.uuid,
            clientId: client.id,
            clientSecret: secretKey,
        };
    }

    async adminRequest(client: Client): Promise<void> {
        await firstValueFrom(
            this.httpService.post(
                this.configService.get<string>('SLACK_WEBHOOK_URL'),
                {
                    text: `Service server ${client.id} sends permission request`,
                    attachments: [
                        {
                            color: '#36a64f',
                            title: 'Details',
                            fields: [
                                { title: 'ClientId', value: `${client.id}` },
                                { title: 'UUID', value: `${client.uuid}` },
                            ],
                        },
                    ],
                },
            ),
        ).catch(() => {
            throw new InternalServerErrorException(
                'Failed to send slack message',
            );
        });
    }

    async resetClientSecret(
        uuid: string,
        user: User,
    ): Promise<ClientCredentialDTO> {
        const { secretKey, hashed } = this.generateSecretKey();
        const client = await this.clientRepository.updateClientPassword(
            {
                uuid,
                password: hashed,
            },
            user,
        );
        return {
            uuid: client.uuid,
            clientId: client.id,
            clientSecret: secretKey,
        };
    }

    async updateClient(
        { name, urls }: UpdateClientDTO,
        client: Client,
    ): Promise<void> {
        await this.clientRepository.updateClient({ name, urls }, client);
        return;
    }

    async validateClient(id: string, secret: string): Promise<Client> {
        const client = await this.clientRepository.findById({ id });
        if (!client) return null;
        if (!bcrypt.compareSync(secret, client.password)) return null;
        return client;
    }

    async validateUri(id: string, url: string): Promise<boolean> {
        const client = await this.clientRepository.findById({ id });
        if (!client) throw new NotFoundException('Client not found');
        if (!client.urls) return false;
        return client.urls.includes(url);
    }

    private generateSecretKey(): { secretKey: string; hashed: string } {
        const secretKey = this.generateRandomString(32);
        return {
            secretKey,
            hashed: bcrypt.hashSync(secretKey, bcrypt.genSaltSync(10)),
        };
    }

    private generateRandomString(length: number): string {
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * characters.length),
            );
        }
        return result;
    }
}
