import {Readable} from "stream";


export abstract class FFMPEGService {

    protected readonly FFMPEG_TIME_REGEX = /time=(\d\d:\d\d:\d\d\.\d\d)/;

    abstract convertStream(args: string[]): Readable;
}