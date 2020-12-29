import {IsNotEmpty, IsPositive} from "class-validator";


export class GifDto {

    @IsNotEmpty()
    v: string;

    @IsPositive()
    start: number;

    @IsPositive()
    time: number;
}