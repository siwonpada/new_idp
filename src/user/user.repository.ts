import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { User } from 'src/global/entity/user.entity';
import { UserType } from 'src/global/type/user.type';
import { EntityManager } from 'typeorm';

@Injectable()
export class UserRepository {
    constructor(private readonly entityManager: EntityManager) {}

    async findOneByEmailId({
        userEmailId,
    }: Pick<UserType, 'userEmailId'>): Promise<User> {
        return this.entityManager.findOne(User, {
            where: { userEmailId },
        });
    }

    async findOneByUuid({
        userUuid,
    }: Pick<UserType, 'userUuid'>): Promise<User> {
        return this.entityManager.findOne(User, {
            where: { userUuid },
        });
    }

    async createUser({
        userEmailId,
        userPassword,
        userName,
        studentId,
        userPhoneNumber,
    }: Omit<UserType, 'accessLevel' | 'userUuid'>): Promise<User> {
        const createdUser = this.entityManager.create(User, {
            userEmailId,
            userPassword,
            userName,
            studentId,
            userPhoneNumber,
        });
        return await this.entityManager.save(createdUser).catch((e) => {
            if (e.errno === 1062)
                throw new ConflictException('user alread exists');
            else throw new InternalServerErrorException(e.sqlMessage);
        });
    }

    async updatePassword({
        userEmailId,
        userPassword,
    }: Pick<UserType, 'userEmailId' | 'userPassword'>): Promise<void> {
        await this.entityManager
            .update(User, userEmailId, { userPassword })
            .catch(() => {
                throw new NotFoundException('user not found');
            });
    }

    async deleteUser({
        userEmailId,
    }: Pick<UserType, 'userEmailId'>): Promise<void> {
        await this.entityManager
            .transaction(async (transactionEntityManager: EntityManager) => {
                await transactionEntityManager.delete(User, { userEmailId });
            })
            .catch(() => {
                throw new NotFoundException('user not found');
            });
    }
}
