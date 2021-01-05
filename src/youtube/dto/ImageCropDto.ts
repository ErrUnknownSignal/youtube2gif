import {IsPositive, Min} from "class-validator";

export class ImageCropDto {

    @Min(0)
    x: number;

    @Min(0)
    y: number;

    @IsPositive()
    width: number;

    @IsPositive()
    height: number;
}