import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('client_tb')
export class Client {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ unique: true })
    id: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @Column('simple-array', { default: () => "('')" })
    urls: string[];

    @Column({ default: 'DISALLOW' })
    role: string;

    @ManyToMany(() => User, (user) => user.clients)
    members: User[];
}
