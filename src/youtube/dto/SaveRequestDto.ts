import {ConvertRequestType} from "../enums/ConvertRequestType";

export class SaveRequestDto {

    v: string;

    type: ConvertRequestType;

    path: string;
}