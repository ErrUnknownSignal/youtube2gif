import {ConvertRangeDto} from "../../youtube/dto/ConvertRangeDto";
import {ConvertTimeDto} from "../../youtube/dto/ConvertTimeDto";
import * as ytdl from 'ytdl-core';

// actually encoding service
export abstract class EncodingWorker<T> {

    abstract encodeGif(gifDto: ConvertRangeDto, bundle: {[key: string]: any}): T;

    abstract encodePng(imageDto: ConvertTimeDto, bundle: {[key: string]: any}): T;

    abstract encodeMp3(mp3Dto: ConvertRangeDto, bundle: {[key: string]: any}): T;

    public async getVideoDownloadUrl(v: string, quality: string): Promise<string> {
        const info = await ytdl.getInfo(v);
        return ytdl.chooseFormat(
                info.formats
                .filter(o => o.hasVideo)
                .filter(o => !o.hasAudio)
                .filter(o => o.quality === quality)
                .sort((a, b) => a.fps - b.fps), {quality: 'highestvideo'}
            ).url;
    }

    public async getAudioDownloadUrl(v: string, quality: string): Promise<string> {
        const info = await ytdl.getInfo(v);
        return ytdl.chooseFormat(
                info.formats
                .filter(o => !o.hasVideo)
                .filter(o => o.hasAudio)
                .filter(o => o.audioQuality === quality), {quality: 'highestaudio'}
            ).url;
    }
}