import {YoutubeService} from "./youtube.service";
import {ConvertTimeDto} from "../../dto/ConvertTimeDto";
import {execFile} from "child_process";
import {ConvertRangeDto} from "../../dto/ConvertRangeDto";
import {TemporaryFileService} from "../../../encoding/service/TemporaryFileService";
import {Test, TestingModule} from "@nestjs/testing";
import {CommandBus, ICommand, ICommandBus} from "@nestjs/cqrs";
import {join} from "path";
import * as os from "os";
import {EncodingBroker} from "../../../encoding/service/EncodingBroker";
import {ConvertingStream} from "../../utils/ConvertingStream";
import {ConvertType} from "../../enums/ConvertType";

describe('youtube service', () => {
    const FIXED_TEST_FILE_NAME = 'youtube-convert-test';
    const testImg = join(os.tmpdir(), FIXED_TEST_FILE_NAME);
    let youtubeService: YoutubeService;
    let temporaryFileService: TemporaryFileService;

    //https://stackoverflow.com/a/49428486
    async function streamToString(stream): Promise<string> {
        const chunks = []
        return new Promise((resolve, reject) => {
            stream.on('data', chunk => chunks.push(chunk))
            stream.on('error', reject)
            stream.on('close', () => resolve(Buffer.concat(chunks).toString('utf8')))
        })
    }

    beforeEach(async (done) => {
        temporaryFileService = new class implements TemporaryFileService {
            createTemporaryFile(extension: string): string[] {
                return [testImg + '.' + extension, os.tmpdir(), FIXED_TEST_FILE_NAME + '.' + extension];
            }
        }
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                YoutubeService,
                {provide: CommandBus, useFactory: () => new class implements ICommandBus {
                        execute<T extends ICommand>(command: T): Promise<any> {
                            return Promise.resolve(undefined);
                        }
                    }},
                {provide: EncodingBroker, useFactory: () => new class implements EncodingBroker {
                        encodeGif(gifDto: ConvertRangeDto): ConvertingStream {
                            return this.stream('gif');
                        }

                        encodeMp3(mp3Dto: ConvertRangeDto): ConvertingStream {
                            return this.stream('mp3');
                        }

                        encodePng(imageDto: ConvertTimeDto): ConvertingStream {
                            return this.stream('png');
                        }

                        async getQueueLength(type: ConvertType): Promise<number> {
                            return Promise.resolve(0);
                        }

                        private stream(type: string) {
                            const stream = new ConvertingStream();
                            setImmediate(() => {
                                stream.push('00:00:00.00');
                                stream.push('youtube-convert-test.' + type);
                                setImmediate(() => {
                                    stream.destroy();
                                });
                            });
                            return stream;
                        }
                }},
                // {provide: 'TemporaryFileService', useValue: temporaryFileService}
            ]
        }).compile();
        youtubeService = module.get<YoutubeService>(YoutubeService);
        jest.setTimeout(30 * 1000);
        done();
    });

    it('ffmpeg check', async (done) => {
        execFile('ffmpeg', ['-version'], (error, stdout, stderr) => {
            if (error) {
                console.error(stderr);
                console.error(stdout);
                expect(error).toThrowError();
            }
            expect(stdout).not.toBeNull();
            expect(stdout).not.toBeUndefined();
            expect(stdout).not.toEqual('');
            done();
        });
    });

    it('wrong youtube video test', async (done) => {
        const img = new ConvertTimeDto();
        img.v = 'null';
        img.time = 6;

        streamToString(await youtubeService.imageStream(img)).then((str) => {
            expect(str).toBeUndefined();
        }).catch((e) => {
            expect(e).not.toBeUndefined();
            done();
        });
    });

    it('youtube to image stream', async (done) => {
        const img = new ConvertTimeDto();
        img.v = 'dQw4w9WgXcQ';
        img.time = 18;

        streamToString(youtubeService.imageStream(img)).then((result) => {
            console.log(result);
            expect(result).not.toEqual('');
            expect(result).toMatch(/\d\d:\d\d:\d\d\.\d\d/);
            expect(result).toContain('youtube-convert-test.png');
            done();

        }).catch((e) => {
            console.error(e);
            expect(e).toThrow();
            done(e);
        });
    });

    it('youtube to image stream disconnect handling', async (done) => {
        const img = new ConvertTimeDto();
        img.v = 'dQw4w9WgXcQ';
        img.time = 18;

        const readable = youtubeService.imageStream(img)
        setTimeout(() => {
            readable.destroy();
            done();
        }, 1000);
    });


    it('youtube to gif stream', async (done) => {
        const img = new ConvertRangeDto();
        img.v = 'dQw4w9WgXcQ';
        img.start = 18;
        img.time = 3;
        img.quality = 1

        streamToString(youtubeService.gifStream(img)).then((result) => {
            console.log(result);
            expect(result).not.toEqual('');
            expect(result).toMatch(/\d\d:\d\d:\d\d\.\d\d/);
            expect(result).toContain('youtube-convert-test.gif');
            done();

        }).catch((e) => {
            console.error(e);
            expect(e).toThrow();
            done(e);
        });
    });


    it('youtube to mp3 stream', async (done) => {
        const img = new ConvertRangeDto();
        img.v = 'dQw4w9WgXcQ';
        img.start = 18;
        img.time = 3;

        streamToString(youtubeService.mp3Stream(img)).then((result) => {
            console.log(result);
            expect(result).not.toEqual('');
            expect(result).toMatch(/\d\d:\d\d:\d\d\.\d\d/);
            expect(result).toContain('youtube-convert-test.mp3');
            done();

        }).catch((e) => {
            console.error(e);
            expect(e).toThrow();
            done(e);
        });
    });

    //IF test does not end, add --forceExit option
    //https://github.com/facebook/jest/issues/1456#issuecomment-264085806
});
