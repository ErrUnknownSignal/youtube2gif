import {ConvertRequestType} from "../enums/ConvertRequestType";
import {ConvertRangeDto} from "./ConvertRangeDto";
import {ConvertTimeDto} from "./ConvertTimeDto";

export class SaveRequestDto {

    v: string;

    type: ConvertRequestType;

    path: string;

    public static newTimeSeriesData(val: ConvertRangeDto, type: ConvertRequestType, path: string): SaveRequestDto {
        const request = new SaveRequestDto();
        request.v = val.v;
        request.type = type;
        request.path = path.replace('\\', '/');
        return request;
    }

    public static newNonTimeSeriesData(val: ConvertTimeDto, path: string): SaveRequestDto {
        const request = new SaveRequestDto();
        request.v = val.v;
        request.type = ConvertRequestType.PNG;
        request.path = path.replace('\\', '/');
        return request;
    }
}