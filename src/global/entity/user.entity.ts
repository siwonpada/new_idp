import { stringLength } from '@global/constant/string.length';
import { AccessLevel, UserType } from '@global/types/user.type';
import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Client } from './client.entity';

@Entity('user_tb')
export class User implements UserType {
    @PrimaryGeneratedColumn('uuid')
    userUuid: string;

    @Column({ unique: true, length: stringLength.MEDIUM })
    userName: string;

    @Column({ length: stringLength.LONG })
    userEmailId: string;

    @Column({ length: stringLength.MEDIUM })
    userPassword: string;

    @Column({ unique: true })
    studentId: string;

    @Column({ length: stringLength.PHONE })
    userPhoneNumber: string;

    @Column({ default: AccessLevel.USER })
    accessLevel: number;

    @ManyToMany(() => Client, (client) => client.members)
    @JoinTable()
    clients: Client[];
}
