import {ConvertRangeDto} from "../../youtube/dto/ConvertRangeDto";
import {ConvertTimeDto} from "../../youtube/dto/ConvertTimeDto";
import {ConvertingStream} from "../../youtube/utils/ConvertingStream";
import {ConvertType} from "../../youtube/enums/ConvertType";

// handle request encoding
export abstract class EncodingBroker {

    abstract encodeGif(gifDto: ConvertRangeDto): ConvertingStream;

    abstract encodePng(imageDto: ConvertTimeDto): ConvertingStream;

    abstract encodeMp3(mp3Dto: ConvertRangeDto): ConvertingStream;

    async abstract getQueueLength(type: ConvertType): Promise<number>;
}