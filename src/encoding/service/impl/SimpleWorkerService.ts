import {EncodingWorker} from "../EncodingWorker";
import {ConvertingStream} from "../../../youtube/utils/ConvertingStream";
import {Inject, Injectable} from "@nestjs/common";
import {TemporaryFileService} from "../TemporaryFileService";
import {ConvertRangeDto} from "../../../youtube/dto/ConvertRangeDto";
import {ConvertTimeDto} from "../../../youtube/dto/ConvertTimeDto";
import {Readable} from "stream";
import {FFMPEGService} from "../FFMPEGService";
import {VideoQuality} from "../../../youtube/enums/VideoQuality";
import {AudioQuality} from "../../../youtube/enums/AudioQuality";


@Injectable()
export class SimpleWorkerService extends EncodingWorker<Readable> {

    constructor(@Inject('TemporaryFileService') private readonly temporaryFileService: TemporaryFileService,
                private readonly ffmpegService: FFMPEGService) {
        super();
    }

    encodeGif(gifDto: ConvertRangeDto, bundle: {[key: string]: any}): Readable {
        // https://stackoverflow.com/questions/26187181/writing-to-a-writestream-from-event-handler
        const returnStream = new ConvertingStream();
        this.getVideoDownloadUrl(gifDto.v, VideoQuality[Object.keys(VideoQuality)[gifDto.quality]]).then((url) => {
            const tempFile = this.temporaryFileService.createTemporaryFile('gif');
            const args = ['-ss', String(gifDto.start), '-t', String(gifDto.time), '-i', url, '-y', tempFile[0]];

            this.handleStream(args, tempFile[2], returnStream);
        }).catch((e) => {
            returnStream.destroy(e);
        });
        return returnStream;
    }

    encodePng(imageDto: ConvertTimeDto, bundle: {[key: string]: any}): Readable {
        const returnStream = new ConvertingStream();
        this.getVideoDownloadUrl(imageDto.v, VideoQuality[Object.keys(VideoQuality)[imageDto.quality]]).then((url) => {
            const tempFile = this.temporaryFileService.createTemporaryFile('png');
            const args = ['-ss', String(imageDto.time), '-i', url, '-frames:v', '1', '-an', '-y', tempFile[0]];

            this.handleStream(args, tempFile[2], returnStream);
        }).catch((e) => {
            returnStream.destroy(e);
        });
        return returnStream;
    }

    encodeMp3(mp3Dto: ConvertRangeDto, bundle: {[key: string]: any}): Readable {
        const returnStream = new ConvertingStream();
        this.getAudioDownloadUrl(mp3Dto.v, AudioQuality[Object.keys(AudioQuality)[mp3Dto.quality]]).then((url) => {
            const tempFile = this.temporaryFileService.createTemporaryFile('mp3');

            const args = ['-ss', String(mp3Dto.start), '-t', String(mp3Dto.time), '-i', url, '-y', tempFile[0]];
            this.handleStream(args, tempFile[2], returnStream);
        }).catch((e) => {
            returnStream.destroy(e);
        });
        return returnStream;
    }

    private handleStream(args: string[], path: string, returnStream: Readable): void {
        const ffmpegStream = this.ffmpegService.convertStream(args);
        ffmpegStream.on('data', (data) => {
            returnStream.push(data);
        });
        ffmpegStream.on('error', (e) => {
            returnStream.destroy(e);
        });
        ffmpegStream.on('close', () => {
            returnStream.push(path + '\n');
            if (!returnStream.destroyed) {
                returnStream.destroy();
            }
        });
    }
}