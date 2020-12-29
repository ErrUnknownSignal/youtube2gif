import {IsNotEmpty, IsPositive} from "class-validator";


export class ConvertRangeDto {

    @IsNotEmpty()
    v: string;

    @IsPositive()
    start: number;

    @IsPositive()
    time: number;
}