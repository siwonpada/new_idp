import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Client } from './client.entity';
import { User } from './user.entity';
import { RefreshToken } from './refreshToken.entity';

@Index(['clientUUID', 'userUUID'], { unique: true })
@Entity('consent')
export class Consent {
    @PrimaryColumn()
    clientUuid: string;

    @PrimaryColumn()
    userUuid: string;

    @Column('simple-array')
    scopes: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Client, (client) => client.uuid, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'clientUuid' })
    client: Client;

    @ManyToOne(() => User, (user) => user.userUuid, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userUuid' })
    user: User;

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.consent, {
        orphanedRowAction: 'delete',
    })
    refreshTokens: RefreshToken[];
}
