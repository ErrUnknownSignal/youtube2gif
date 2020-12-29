import {Inject, Injectable} from "@nestjs/common";
import * as ytdl from 'ytdl-core'
import {videoInfo} from 'ytdl-core'
import {execFile} from "child_process";
import {GifDto} from "../../dto/GifDto";
import {ImageDto} from "../../dto/ImageDto";
import {SaveRequestDto} from "../../dto/SaveRequestDto";
import {ImageType} from "../../enums/ImageType";
import {TemporaryFileService} from "../TemporaryFileService";
import {CommandBus} from "@nestjs/cqrs";


@Injectable()
export class YoutubeService {

    constructor(private commandBus: CommandBus, @Inject('TemporaryFileService') private temporaryFileService: TemporaryFileService) {
    }

    async gif(gifDto: GifDto): Promise<string> {
        return new Promise(async (resolve, reject) => {
            // const tempFile = this.createTemporaryFile('gif');
            const tempFile = this.temporaryFileService.createTemporaryFile('gif');
            const info = await this.getInfo(gifDto.v);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
            const args = ['-ss', String(gifDto.start), '-t', String(gifDto.time), '-i', format.url, '-y', tempFile];
            console.log(args);
            execFile('ffmpeg', args, (error, stdout, stderr) => {
                if (error) {
                    console.error(stderr);
                    console.error(stdout);
                    return reject(error);
                }
                const saveDto = new SaveRequestDto();
                saveDto.v = gifDto.v;
                saveDto.type = ImageType.GIF;
                saveDto.path = tempFile;

                this.commandBus.execute(saveDto);

                resolve(tempFile);
            });
        });
    }

    //https://github.com/fent/node-ytdl-core/blob/master/example/take_screenshot.js
    async image(imageDto: ImageDto): Promise<string> {
        console.log(imageDto);
        return new Promise(async (resolve, reject) => {
            // const tempFile = this.createTemporaryFile('png');
            const tempFile = this.temporaryFileService.createTemporaryFile('png');
            const info = await this.getInfo(imageDto.v);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
            const args = ['-ss', String(imageDto.t), '-i', format.url, '-frames:v', '1', '-an', '-y', tempFile];
            console.log(args);
            execFile('ffmpeg', args, (error, stdout, stderr) => {
                if (error) {
                    console.error(stderr);
                    console.error(stdout);
                    return reject(error);
                }
                const saveDto = new SaveRequestDto();
                saveDto.v = imageDto.v;
                saveDto.type = ImageType.PNG;
                saveDto.path = tempFile;

                this.commandBus.execute(saveDto);

                resolve(tempFile);
            });
        });
    }

    private async getInfo(v: string): Promise<videoInfo> {
        return await ytdl.getInfo(v);
    }
}