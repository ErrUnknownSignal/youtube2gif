import {TemporaryFileService} from "../TemporaryFileService";
import * as os from "os";
import {join} from "path";
import {EncodingWorker} from "../EncodingWorker";
import {Readable} from "stream";
import {SimpleWorkerService} from "./SimpleWorkerService";
import {FFMPEGServiceImpl} from "./FFMPEGServiceImpl";
import {QueueWorkerService} from "./QueueWorkerService";
import {ConvertTimeDto} from "../../../youtube/dto/ConvertTimeDto";
import {ConvertRangeDto} from "../../../youtube/dto/ConvertRangeDto";
import * as fs from "fs";
import {
    ConsumerRunConfig,
    ConsumerSubscribeTopic,
    ProducerRecord,
    RecordMetadata,
    SeekEntry,
    TopicPartitionOffsetAndMetadata
} from "kafkajs";


jest.mock('@nestjs/microservices');
jest.mock('kafkajs');


describe('encoding test', () => {

    const FIXED_TEST_FILE_NAME = 'youtube-convert-test';
    const testImg = join(os.tmpdir(), FIXED_TEST_FILE_NAME);
    let temporaryFileService: TemporaryFileService;
    let ffmpegService: FFMPEGServiceImpl;


    let convertTimeDto: ConvertTimeDto;
    let convertRangeDto: ConvertRangeDto;


    //https://stackoverflow.com/a/49428486
    async function streamToString(stream): Promise<string> {
        const chunks = []
        return new Promise((resolve, reject) => {
            stream.on('data', chunk => chunks.push(chunk))
            stream.on('error', reject)
            stream.on('close', () => resolve(Buffer.concat(chunks).toString('utf8')))
        });
    }


    beforeAll(async (done) => {
        ffmpegService = new FFMPEGServiceImpl();
        temporaryFileService = new class implements TemporaryFileService {
            createTemporaryFile(extension: string): string[] {
                return [testImg + '.' + extension, os.tmpdir(), FIXED_TEST_FILE_NAME + '.' + extension];
            }
        };

        convertTimeDto = new ConvertTimeDto();
        convertTimeDto.v = 'dQw4w9WgXcQ';
        convertTimeDto.time = 18;
        convertTimeDto.quality = 0;

        convertRangeDto = new ConvertRangeDto();
        convertRangeDto.v = 'dQw4w9WgXcQ';
        convertRangeDto.start = 18;
        convertRangeDto.time = 3;
        convertRangeDto.quality = 0;

        jest.setTimeout(30 * 1000);
        done();
    });

    it('test ffmpegService',  async(done) => {
        streamToString(ffmpegService.convertStream(['-version'])).then((result) => {
            expect(result).toMatch(/ffmpeg version .+/);
            done();
        }).catch((e) => {
            expect(e).toBeFalsy();
            done();
        });
    });

    it('test DTO to string', () => {
        expect(convertTimeDto.toString()).toEqual('v-dQw4w9WgXcQ_time-18_quality-0');
        expect(convertRangeDto.toString()).toEqual('v-dQw4w9WgXcQ_start-18_time-3_quality-0');
    });


    describe('default queue ', () => {
        let simpleEncoder: EncodingWorker<Readable>;

        beforeAll((done) => {
            simpleEncoder = new SimpleWorkerService(temporaryFileService, ffmpegService);
            done();
        });


        it('simple encoder gif', async (done) => {
            streamToString(simpleEncoder.encodeGif(convertRangeDto, {})).then((result) => {
                expect(result).toBeTruthy();
                expect(result).toMatch(/\d\d:\d\d:\d\d\.\d\d/);
                expect(result).toContain('youtube-convert-test.gif');

                fs.stat(testImg + '.gif', (err, stat) => {
                    expect(err).toBeFalsy();
                    expect(stat).toBeTruthy();
                    done();
                });
            }).catch((e) => {
                expect(e).toBeFalsy();
                done();
            });
        });

        it('simple encoder png', async (done) => {
            streamToString(simpleEncoder.encodePng(convertTimeDto, {})).then((result) => {
                expect(result).toBeTruthy();
                // expect(result).toMatch(/\d\d:\d\d:\d\d\.\d\d/);
                expect(result).toContain('youtube-convert-test.png');

                fs.stat(testImg + '.png', (err, stat) => {
                    expect(err).toBeFalsy();
                    expect(stat).toBeTruthy();
                    done();
                });
            }).catch((e) => {
                expect(e).toBeFalsy();
                done();
            });
        });

        it('simple encoder mp3', async (done) => {
            streamToString(simpleEncoder.encodeMp3(convertRangeDto, {})).then((result) => {
                expect(result).toBeTruthy();
                expect(result).toMatch(/\d\d:\d\d:\d\d\.\d\d/);
                expect(result).toContain('youtube-convert-test.mp3');

                fs.stat(testImg + '.mp3', (err, stat) => {
                    expect(err).toBeFalsy();
                    expect(stat).toBeTruthy();
                    done();
                });
            }).catch((e) => {
                expect(e).toBeFalsy();
                done();
            });
        });


        afterAll(() => {
            fs.unlinkSync(testImg + '.gif');
            fs.unlinkSync(testImg + '.png');
            fs.unlinkSync(testImg + '.mp3');
        });
    });


    describe('kafka queue service', () => {
        let kafka; //Kafka mock
        let mockConsumer;
        let mockProducer;
        let mockAdmin;
        let queue = [];
        let subscribed = [];
        let eachMessageCb;
        let commitOffsets;

        let queueChecker;

        let queueEncoder: EncodingWorker<void>;

        beforeAll((done) => {
            mockConsumer = jest.fn().mockImplementation(() => {
                return {
                    disconnect: jest.fn(() => Promise.resolve()),
                    subscribe: jest.fn((topic: ConsumerSubscribeTopic) => {
                        subscribed.push(topic);
                        return Promise.resolve();
                    }),
                    run: jest.fn((config?: ConsumerRunConfig) => {
                        eachMessageCb = config.eachMessage;
                        return Promise.resolve();
                    }),
                    commitOffsets: jest.fn((topicPartitions: Array<TopicPartitionOffsetAndMetadata>) => {
                        commitOffsets = topicPartitions;
                        return Promise.resolve();
                    })
                }
            });
            mockProducer = jest.fn().mockImplementation(() => {
                return {
                    disconnect: jest.fn(() => Promise.resolve()),
                    connect: jest.fn(() => Promise.resolve()),
                    send: jest.fn((record: ProducerRecord): Promise<RecordMetadata[]> => {
                        for (const m of record.messages) {
                            queue.push({topic: record.topic, data: m.value});
                        }
                        return Promise.resolve(undefined);
                    })
                }
            });
            mockAdmin = jest.fn().mockImplementation(() => {
                return {
                    disconnect: jest.fn(() => Promise.resolve()),
                    connect: jest.fn(() => Promise.resolve()),
                    fetchOffsets: jest.fn((options: {
                        groupId: string
                        topic: string
                        resolveOffsets?: boolean
                    }): Promise<Array<SeekEntry & { metadata: string | null }>> => {
                        return Promise.resolve([{offset: '-1', metadata: null, partition: 0}]);
                    })
                }
            });

            kafka = jest.fn(() => ({
                admin: jest.fn(() => mockAdmin()),
                consumer: jest.fn(() => mockConsumer()),
                producer: jest.fn(() => mockProducer())
            }))();

            queueEncoder = new QueueWorkerService(temporaryFileService, ffmpegService, kafka, 'y2g-test-worker');

            queueChecker = (pattern: RegExp, done: (...args: any[]) => any) => {
                const start = Date.now();
                const interval = setInterval(() => {
                    if (Date.now() - start > 15 * 1000) {
                        clearInterval(interval);
                        throw new Error('timeout');
                    }
                    for (const q of queue) {
                        expect(q.error).toBeFalsy();
                        if (typeof q.data === 'string') {
                            q.data = JSON.parse(q.data);
                        }
                        if (q.data.result) {
                            clearInterval(interval);
                            expect(q.data.result).toMatch(pattern);
                            done();
                        } else if (!q.data.data) {
                            clearInterval(interval);
                            throw new Error('unknown queue element: ' + q);
                        }
                    }
                }, 1000);
            };
            done();
        });

        beforeEach(() => {
            mockConsumer.mockClear();
            mockProducer.mockClear();
            mockAdmin.mockClear();
            queue = [];
            subscribed = [];
        });


        describe('test service directly', () => {

            it('queue encoder gif', async (done) => {
                queueEncoder.encodeGif(convertRangeDto, {});
                queueChecker(/^http.+\.gif$/, done);
            });

            it('queue encoder png', async (done) => {
                queueEncoder.encodePng(convertTimeDto, {});
                queueChecker(/^http.+\.png$/, done);
            });

            it('queue encoder mp3', async (done) => {
                queueEncoder.encodeMp3(convertRangeDto, {});
                queueChecker(/^http.+\.mp3$/, done);
            });
        });

        describe('test mocked queue', () => {

            it('queue message encoder gif', async (done) => {
                const buffer = Buffer.from(JSON.stringify(convertRangeDto), 'utf8');
                eachMessageCb({
                    topic: 'y2g.gif',
                    partition: '1',
                    message: {
                        key: buffer,
                        value: buffer,
                        timestamp: '',
                        size: 0,
                        attributes: 0,
                        offset: 0
                    }
                });
                queueChecker(/^http.+\.gif$/, done);
            });

            it('queue message encoder png', async (done) => {
                const buffer = Buffer.from(JSON.stringify(convertTimeDto), 'utf8');
                eachMessageCb({
                    topic: 'y2g.png',
                    partition: '1',
                    message: {
                        key: buffer,
                        value: buffer,
                        timestamp: '',
                        size: 0,
                        attributes: 0,
                        offset: 0
                    }
                });
                queueChecker(/^http.+\.png$/, done);
            });

            it('queue message encoder mp3', async (done) => {
                const buffer = Buffer.from(JSON.stringify(convertRangeDto), 'utf8');
                eachMessageCb({
                    topic: 'y2g.mp3',
                    partition: '1',
                    message: {
                        key: buffer,
                        value: buffer,
                        timestamp: '',
                        size: 0,
                        attributes: 0,
                        offset: 0
                    }
                });
                queueChecker(/^http.+\.mp3$/, done);
            });
        });

        afterAll(() => {
            fs.unlinkSync(testImg + '.gif');
            fs.unlinkSync(testImg + '.png');
            fs.unlinkSync(testImg + '.mp3');

            queueEncoder['onModuleDestroy']();
        });
    });

    //https://github.com/BulbEnergy/jest-mock-examples
    //https://github.com/tbinna/ts-jest-mock-examples
    //https://github.com/YegorZaremba/typeorm-mock-unit-testing-example
});