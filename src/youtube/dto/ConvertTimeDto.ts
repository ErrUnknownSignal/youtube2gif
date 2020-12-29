import {IsNotEmpty, IsPositive} from "class-validator";

export class ConvertTimeDto {
    @IsNotEmpty()
    v: string;

    @IsPositive()
    t: number;
}