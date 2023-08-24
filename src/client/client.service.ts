import { Injectable, NotFoundException } from '@nestjs/common';
import { Client } from 'src/global/entity/client.entity';
import { User } from 'src/global/entity/user.entity';
import { ClientRepository } from './client.repository';
import * as bcrypt from 'bcrypt';
import { ClientInfoDto } from './dto/req/clientInfo.dto';
import { ClientCredentialDTO } from './dto/res/clientCredentialRes.dto';

@Injectable()
export class ClientService {
    constructor(private readonly clientRepository: ClientRepository) {}

    async getClientList(user: User): Promise<Client[]> {
        return user.clients;
    }

    async getClient(uuid: string, user: User): Promise<Client> {
        const client = user.clients.find((client) => client.uuid === uuid);
        if (!client) throw new NotFoundException('Client not found');
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
