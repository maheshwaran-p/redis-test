
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
@Entity()
export class User extends BaseEntity {
    @Column({
        name: 'user_name',
        nullable: true
    })
    userName: string;

    @Column({
        name: 'email',
        nullable: true
    })
    email: string;
    @Column({
        name: 'password_hash',
        nullable: true
    })
    passwordHash: String;
    @Column({ name: 'access_token' })
    access_token: String

}