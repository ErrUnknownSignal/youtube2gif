import {IsNotEmpty, IsPositive} from "class-validator";

export class ImageDto {
    @IsNotEmpty()
    v: string;

    @IsPositive()
    t: number;
}