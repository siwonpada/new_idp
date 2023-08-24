import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { Client } from 'src/global/entity/client.entity';
import { User } from 'src/global/entity/user.entity';
import { ClientType } from 'src/global/type/client.type';
import { EntityManager } from 'typeorm';

@Injectable()
export class ClientRepository {
    constructor(private readonly entityManager: EntityManager) {}

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
        if (!client) throw new NotFoundException('client not found');
        client.password = password;
        return await this.entityManager.save(client);
    }
}
