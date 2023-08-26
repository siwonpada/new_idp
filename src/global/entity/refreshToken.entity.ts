import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Consent } from './consent.entity';
import { Scope } from 'src/oauth/oauth.service';

@Entity('refresh_token')
export class RefreshToken {
    @PrimaryColumn()
    token: string;

    @Column('simple-array')
    scopes: Scope[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Consent, {
        eager: true,
        orphanedRowAction: 'delete',
        nullable: false,
    })
    consent: Consent;
}
