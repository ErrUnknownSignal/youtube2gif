import {Inject, Injectable} from "@nestjs/common";
import * as ytdl from 'ytdl-core'
import {videoInfo} from 'ytdl-core'
import {execFile, spawn} from "child_process";
import {ConvertRangeDto} from "../../dto/ConvertRangeDto";
import {ConvertTimeDto} from "../../dto/ConvertTimeDto";
import {SaveRequestDto} from "../../dto/SaveRequestDto";
import {ConvertRequestType} from "../../enums/ConvertRequestType";
import {TemporaryFileService} from "../TemporaryFileService";
import {CommandBus} from "@nestjs/cqrs";
import * as os from 'os';
import {Readable} from 'stream';
import {ConvertingStream} from "../../utils/ConvertingStream";
import {VideoQuality} from "../../enums/VideoQuality";
import {AudioQuality} from "../../enums/AudioQuality";


@Injectable()
export class YoutubeService {

    private readonly FFMPEG_TIME_REGEX = /time=(\d\d:\d\d:\d\d\.\d\d)/;

    constructor(private commandBus: CommandBus, @Inject('TemporaryFileService') private temporaryFileService: TemporaryFileService) {
    }

    gifStream(gifDto: ConvertRangeDto): ConvertingStream {
        //https://stackoverflow.com/questions/26187181/writing-to-a-writestream-from-event-handler
        const readable = new ConvertingStream();
        const tempFile = this.temporaryFileService.createTemporaryFile('gif');
        const quality = VideoQuality[Object.keys(VideoQuality)[gifDto.quality]];

        this.getInfo(gifDto.v).then((info) => {
            if (readable.destroyed) {
                return;
            }
            const formats = info.formats
                .filter(o => o.hasVideo)
                .filter(o => o.quality === quality)
                .sort((a, b) => a.fps - b.fps);

            const format = ytdl.chooseFormat(formats, {quality: 'highestvideo'});
            const args = ['-ss', String(gifDto.start), '-t', String(gifDto.time), '-i', format.url, '-y', tempFile[0]];
            this.convertStream(args, readable, SaveRequestDto.newTimeSeriesData(gifDto, ConvertRequestType.GIF, tempFile[2]));

        }).catch((e) => {
            console.error(e);
            readable.destroy(e);
        });
        return readable;
    }

    /**
     *
     * @deprecated use gifStream
     */
    async gif(gifDto: ConvertRangeDto): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const tempFile = this.temporaryFileService.createTemporaryFile('gif');
            const info = await this.getInfo(gifDto.v);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
            const args = ['-ss', String(gifDto.start), '-t', String(gifDto.time), '-i', format.url, '-y', tempFile[0]];

            this.convert(args, gifDto.v, ConvertRequestType.GIF, tempFile, resolve, reject);
        });
    }

    imageStream(imageDto: ConvertTimeDto): ConvertingStream {
        const readable = new ConvertingStream();
        const tempFile = this.temporaryFileService.createTemporaryFile('png');
        const quality = VideoQuality[Object.keys(VideoQuality)[imageDto.quality]];

        this.getInfo(imageDto.v).then((info) => {
            if (readable.destroyed) {
                return;
            }
            const formats = info.formats
                .filter(o => o.hasVideo)
                .filter(o => o.quality === quality)
                .filter(o => !o.hasAudio);

            const format = ytdl.chooseFormat(formats, { quality: 'highestvideo' });
            const args = ['-ss', String(imageDto.time), '-i', format.url, '-frames:v', '1', '-an', '-y', tempFile[0]];

            this.convertStream(args, readable, SaveRequestDto.newNonTimeSeriesData(imageDto, tempFile[2]));
        }).catch((e) => {
            console.error(e);
            readable.destroy(e);
        })
        return readable;
    }

    /**
     *
     * @deprecated use imageStream
     */
    //https://github.com/fent/node-ytdl-core/blob/master/example/take_screenshot.js
    async image(imageDto: ConvertTimeDto): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const tempFile = this.temporaryFileService.createTemporaryFile('png');
            const info = await this.getInfo(imageDto.v);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
            const args = ['-ss', String(imageDto.time), '-i', format.url, '-frames:v', '1', '-an', '-y', tempFile[0]];

            this.convert(args, imageDto.v, ConvertRequestType.PNG, tempFile, resolve, reject);
        });
    }

    mp3Stream(mp3Dto: ConvertRangeDto): ConvertingStream {
        const readable = new ConvertingStream();
        const tempFile = this.temporaryFileService.createTemporaryFile('mp3');
        const quality = AudioQuality[Object.keys(AudioQuality)[mp3Dto.quality]];

        this.getInfo(mp3Dto.v).then((info) => {
            if (readable.destroyed) {
              return;
            }
            const formats = info.formats
                .filter(o => !o.hasVideo)
                .filter(o => o.hasAudio)
                .filter(o => o.audioQuality === quality);

            const format = ytdl.chooseFormat(formats, { quality: 'highestaudio' });
            const args = ['-ss', String(mp3Dto.start), '-t', String(mp3Dto.time), '-i', format.url, '-y', tempFile[0]];

            this.convertStream(args, readable, SaveRequestDto.newTimeSeriesData(mp3Dto, ConvertRequestType.MP3, tempFile[2]));
        }).catch((e) => {
            console.error(e);
            readable.destroy(e);
        })
        return readable;
    }

    /**
     *
     * @deprecated use mp3Stream
     */
    async mp3(mp3Dto: ConvertRangeDto): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const tempFile = this.temporaryFileService.createTemporaryFile('mp3');
            const info = await this.getInfo(mp3Dto.v);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
            const args = ['-ss', String(mp3Dto.start), '-t', String(mp3Dto.time), '-i', format.url, '-y', tempFile[0]];

            this.convert(args, mp3Dto.v, ConvertRequestType.MP3, tempFile, resolve, reject);
        });
    }


    private async getInfo(v: string): Promise<videoInfo> {
        return await ytdl.getInfo(v);
    }

    private convertStream(args: string[], readStream: Readable, saveRequest: SaveRequestDto): void {
        const process = spawn('ffmpeg', ['-hide_banner'].concat(args));
        process.stdout.on('data', (chunk) => {
            console.log('stdout', chunk.toString());
        });
        process.stderr.on('data', (chunk) => {
            const str = chunk.toString();
            console.log('stderr', str);
            if (this.FFMPEG_TIME_REGEX.test(str)) {
                readStream.push(str.match(this.FFMPEG_TIME_REGEX)[1] + '\n');
            }
        });
        process.on('close', () => {
            if (!readStream.destroyed) {
                //save entity
                this.commandBus.execute(saveRequest).then();
            }
            readStream.push(saveRequest.path + '\n');
            readStream.destroy();
        });

        readStream.on('close', () => {
            if (!process.killed) {
                process.kill();
                // fs.unlink(saveRequest.path)
            }
        });
    }

    private convert(args: string[], v: string, type: ConvertRequestType, filePath: string[], resolve: (value: string) => void, reject: (reason?: any) => void): void {
        execFile('ffmpeg', args, (error, stdout, stderr) => {
            if (error) {
                console.error(stderr);
                console.error(stdout);
                return reject(error);
            }
            if (os.platform() === 'win32') {
                filePath[2] = filePath[2].replace('\\', '/');
            }
            const saveDto = new SaveRequestDto();
            saveDto.v = v;
            saveDto.type = type;
            saveDto.path = filePath[2];

            this.commandBus.execute(saveDto);

            resolve(filePath[2]);
        });
    }
}