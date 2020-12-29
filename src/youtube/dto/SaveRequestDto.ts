import {ImageType} from "../enums/ImageType";

export class SaveRequestDto {

    v: string;

    type: ImageType;

    path: string;
}