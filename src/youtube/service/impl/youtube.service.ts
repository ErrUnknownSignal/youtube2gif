import {Inject, Injectable} from "@nestjs/common";
import * as ytdl from 'ytdl-core'
import {videoInfo} from 'ytdl-core'
import {execFile} from "child_process";
import {ConvertRangeDto} from "../../dto/ConvertRangeDto";
import {ConvertTimeDto} from "../../dto/ConvertTimeDto";
import {SaveRequestDto} from "../../dto/SaveRequestDto";
import {ConvertRequestType} from "../../enums/ConvertRequestType";
import {TemporaryFileService} from "../TemporaryFileService";
import {CommandBus} from "@nestjs/cqrs";


@Injectable()
export class YoutubeService {

    constructor(private commandBus: CommandBus, @Inject('TemporaryFileService') private temporaryFileService: TemporaryFileService) {
    }

    async gif(gifDto: ConvertRangeDto): Promise<string> {
        return new Promise(async (resolve, reject) => {
            // const tempFile = this.createTemporaryFile('gif');
            const tempFile = this.temporaryFileService.createTemporaryFile('gif');
            const info = await this.getInfo(gifDto.v);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
            const args = ['-ss', String(gifDto.start), '-t', String(gifDto.time), '-i', format.url, '-y', tempFile];

            this.convert(args, gifDto.v, ConvertRequestType.GIF, tempFile, resolve, reject);
        });
    }

    //https://github.com/fent/node-ytdl-core/blob/master/example/take_screenshot.js
    async image(imageDto: ConvertTimeDto): Promise<string> {
        console.log(imageDto);
        return new Promise(async (resolve, reject) => {
            // const tempFile = this.createTemporaryFile('png');
            const tempFile = this.temporaryFileService.createTemporaryFile('png');
            const info = await this.getInfo(imageDto.v);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
            const args = ['-ss', String(imageDto.t), '-i', format.url, '-frames:v', '1', '-an', '-y', tempFile];

            this.convert(args, imageDto.v, ConvertRequestType.PNG, tempFile, resolve, reject);
        });
    }

    async mp3(gifDto: ConvertRangeDto): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const tempFile = this.temporaryFileService.createTemporaryFile('mp3');
            const info = await this.getInfo(gifDto.v);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
            const args = ['-ss', String(gifDto.start), '-t', String(gifDto.time), '-i', format.url, '-y', tempFile];

            this.convert(args, gifDto.v, ConvertRequestType.MP3, tempFile, resolve, reject);
        });
    }

    private async getInfo(v: string): Promise<videoInfo> {
        return await ytdl.getInfo(v);
    }

    private convert(args: string[], v: string, type: ConvertRequestType, path: string, resolve: (value: string) => void, reject: (reason?: any) => void): void {
        execFile('ffmpeg', args, (error, stdout, stderr) => {
            if (error) {
                console.error(stderr);
                console.error(stdout);
                return reject(error);
            }
            const saveDto = new SaveRequestDto();
            saveDto.v = v;
            saveDto.type = type;
            saveDto.path = path;

            this.commandBus.execute(saveDto);

            resolve(path);
        });
    }
}