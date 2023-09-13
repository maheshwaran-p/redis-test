import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
    @Column({
        name: 'updated_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

}