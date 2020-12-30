import {IsNotEmpty, Min} from "class-validator";

export class ConvertTimeDto {

    @IsNotEmpty()
    v: string;

    @Min(0)
    time: number;
}