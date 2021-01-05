import {Min} from "class-validator";

export class ImageResizeDto {

    @Min(0)
    width: number;

    @Min(0)
    height: number;
}