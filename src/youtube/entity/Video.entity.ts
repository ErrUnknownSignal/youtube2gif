import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";
import {ConvertRequestType} from "../enums/ConvertRequestType";

@Entity({name: 'video'})
export class VideoEntity {

    @PrimaryGeneratedColumn({unsigned: true})
    id: number;

    @Column("varchar", {length: 32, nullable: false})
    v!: string;

    @Column({type: 'enum', enum: ConvertRequestType, default: ConvertRequestType.PNG, nullable: false})
    type: ConvertRequestType;

    @CreateDateColumn()
    date!: Date;

    @Column("varchar", {length: 64, nullable: false})
    path!: string;

    @Column({type: 'boolean', nullable: false})
    removed = false;
}