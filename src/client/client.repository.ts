import { Client } from '@global/entity/client.entity';
import { User } from '@global/entity/user.entity';
import { ClientType } from '@global/type/client.type';
import {
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class ClientRepository {
    constructor(private readonly entityManager: EntityManager) {}

    async findById({ id }: Pick<ClientType, 'id'>): Promise<Client> {
        return await this.entityManager.findOne(Client, { where: { id } });
    }

    async createClient(
        {
            id,
            name,
            password,
            urls,
        }: Pick<ClientType, 'id' | 'name' | 'password'> &
            Partial<Pick<ClientType, 'urls'>>,
        user: User,
    ): Promise<Client> {
        const client = this.entityManager.create(Client, {
            id,
            name,
            password,
            urls,
            members: [user],
        });
        return await this.entityManager.save(client).catch((e) => {
            if (e.errno === 1062)
                throw new ConflictException('client alread exists');
            else throw new InternalServerErrorException(e.sqlMessage);
        });
    }

    async updateClientPassword(
        { uuid, password }: Pick<ClientType, 'uuid' | 'password'>,
        user: User,
    ): Promise<Client> {
        const client = await this.entityManager.findOne(Client, {
            where: { uuid, members: { userUuid: user.userUuid } },
        });
        if (!client) throw new ForbiddenException('client not found');
        client.password = password;
        return await this.entityManager.save(client);
    }

    async updateClient(
        { name, urls }: Partial<Pick<ClientType, 'name' | 'urls'>>,
        client: Client,
    ): Promise<Client> {
        client.name = name;
        client.urls = urls;
        return await this.entityManager.save(client);
    }
}
