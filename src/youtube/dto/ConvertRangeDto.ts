import {IsNotEmpty, IsPositive, Min} from "class-validator";

export class ConvertRangeDto {

    @IsNotEmpty()
    v: string;

    @Min(0)
    start: number;

    @IsPositive()
    time: number;
}