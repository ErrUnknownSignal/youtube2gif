import {Injectable, Logger} from "@nestjs/common";
import {ConvertRangeDto} from "../../dto/ConvertRangeDto";
import {ConvertTimeDto} from "../../dto/ConvertTimeDto";
import {SaveRequestDto} from "../../dto/SaveRequestDto";
import {ConvertRequestType} from "../../enums/ConvertRequestType";
import {CommandBus} from "@nestjs/cqrs";
import {ConvertingStream} from "../../utils/ConvertingStream";
import {EncodingBroker} from "../../../encoding/service/EncodingBroker";


@Injectable()
export class YoutubeService {

    private readonly logger = new Logger(YoutubeService.name);

    constructor(private commandBus: CommandBus, private encodingBroker: EncodingBroker) {
    }

    gifStream(gifDto: ConvertRangeDto): ConvertingStream {
        const result = new ConvertingStream();
        const readable = this.encodingBroker.encodeGif(gifDto);
        let error;
        let lastChunk;
        readable.on('close', () => {
            setTimeout(() => {
                if (error) {
                    this.logger.error('gifStream occur error', error);
                    result.destroy(error);
                    return;
                }
                result.destroy();
                this.commandBus.execute(SaveRequestDto.newTimeSeriesData(gifDto, ConvertRequestType.GIF, lastChunk.toString())).then();
            }, 5);
        });
        readable.on('error', (e) => {
            error = e;
        });
        readable.on('data', (chunk) => {
            result.push(chunk);
            lastChunk = chunk;
        });
        return result;
    }


    imageStream(imageDto: ConvertTimeDto): ConvertingStream {
        const result = new ConvertingStream();
        const readable = this.encodingBroker.encodePng(imageDto);
        let error;
        let lastChunk;
        readable.on('close', () => {
            setTimeout(() => {
                if (error) {
                    this.logger.error('imageStream occur error', error);
                    result.destroy(error);
                    return;
                }
                result.destroy();
                this.commandBus.execute(SaveRequestDto.newNonTimeSeriesData(imageDto, lastChunk.toString())).then();
            }, 5);
        });
        readable.on('error', (e) => {
            error = e;
        });
        readable.on('data', (chunk) => {
            result.push(chunk);
            lastChunk = chunk;
        });
        return result;
    }


    mp3Stream(mp3Dto: ConvertRangeDto): ConvertingStream {
        const result = new ConvertingStream();
        const readable = this.encodingBroker.encodeMp3(mp3Dto);
        let error;
        let lastChunk;
        readable.on('close', () => {
            setTimeout(() => {
                if (error) {
                    this.logger.error('mp3Stream occur error', error);
                    result.destroy(error);
                    return;
                }
                result.destroy();
                this.commandBus.execute(SaveRequestDto.newTimeSeriesData(mp3Dto, ConvertRequestType.MP3, lastChunk.toString())).then();
            }, 5);
        });
        readable.on('error', (e) => {
            error = e;
        });
        readable.on('data', (chunk) => {
            result.push(chunk);
            lastChunk = chunk;
        });
        return result;
    }
}