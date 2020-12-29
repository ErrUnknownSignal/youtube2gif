import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";
import {ImageType} from "../enums/ImageType";

@Entity({name: 'video'})
export class VideoEntity {

    @PrimaryGeneratedColumn({unsigned: true})
    id: number;

    @Column("varchar", {length: 32, nullable: false})
    v!: string;

    @Column({type: 'enum', enum: ImageType, default: ImageType.PNG, nullable: false})
    type: ImageType;

    @CreateDateColumn()
    date!: Date;

    @Column("varchar", {length: 64, nullable: false})
    path!: string;

    @Column({type: 'boolean', nullable: false})
    removed = false;
}