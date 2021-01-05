import {ImageCropDto} from "./ImageCropDto";
import {IsNotEmpty, Max, Min} from "class-validator";
import {ImageResizeDto} from "./ImageResizeDto";

export class ImageEdit {

    @IsNotEmpty()
    file: string;

    horizon?: boolean;

    vertical?: boolean;

    @Min(0)
    @Max(360)
    rotate?: number;

    crop?: ImageCropDto;

    resize?: ImageResizeDto;
}