import {FFMPEGService} from "../FFMPEGService";
import {Readable} from "stream";
import {spawn} from "child_process";
import {ConvertingStream} from "../../../youtube/utils/ConvertingStream";


export class FFMPEGServiceImpl extends FFMPEGService {

    convertStream(args: string[]): Readable {
        const readStream = new ConvertingStream();
        const process = spawn('ffmpeg', ['-hide_banner'].concat(args));
        process.stdout.on('data', (chunk) => {
            // console.log('stdout', chunk.toString());
            readStream.push(chunk.toString());  //TODO
        });
        process.stderr.on('data', (chunk) => {
            const str = chunk.toString();
            // console.log('stderr', str);
            if (this.FFMPEG_TIME_REGEX.test(str)) {
                readStream.push(str.match(this.FFMPEG_TIME_REGEX)[1]);
            }
        });
        process.on('close', (code: number, signal: NodeJS.Signals) => {
            // console.log('process close', code, signal);
            readStream.destroy();
        });
        // readStream.on('close', () => {
        //     console.log('readStream close');
        //     if (!process.killed) {
        //         process.kill();
        //     }
        // });

        return readStream;
    }
}