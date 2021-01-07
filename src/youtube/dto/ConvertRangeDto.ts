import {IsNotEmpty, IsPositive, Max, Min} from "class-validator";

export class ConvertRangeDto {

    @IsNotEmpty()
    v: string;

    @Min(0)
    start: number;

    @IsPositive()
    time: number;

    @Min(0)
    @Max(4)
    quality: number = 0;
}