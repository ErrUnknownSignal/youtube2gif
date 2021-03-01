import {EncodingBroker} from "../EncodingBroker";
import {Inject, Injectable, Logger, OnModuleDestroy} from "@nestjs/common";
import {ConvertRangeDto} from "../../../youtube/dto/ConvertRangeDto";
import {ConvertTimeDto} from "../../../youtube/dto/ConvertTimeDto";
import {ConvertingStream} from "../../../youtube/utils/ConvertingStream";
import {Admin, Kafka, Producer} from "kafkajs";
import * as assert from "assert";
import * as fs from 'fs';
import {join} from "path";
import got from 'got';
import {DOWNLOAD_PATH} from "../../../main";
import {EventEmitter} from "events";
import {ConvertType} from "../../../youtube/enums/ConvertType";


@Injectable()
export class QueueBrokerService extends EncodingBroker implements OnModuleDestroy {

    private readonly logger = new Logger(QueueBrokerService.name);

    private readonly producer: Producer;
    private readonly admin: Admin;
    private eventEmitter: EventEmitter;

    constructor(private kafka: Kafka, @Inject('workerGroupId') private readonly CONSUMER_GROUP) {
        super();
        this.producer = this.kafka.producer();
        this.producer.connect().catch((e) => {
            this.logger.error('queue broker producer connect error', e);
            throw e;
        });
        this.admin = this.kafka.admin();
        this.admin.connect().catch((e) => {
            this.logger.error('queue broker admin connect error', e);
            throw e;
        });
        this.eventEmitter = new EventEmitter();
    }

    onModuleDestroy(): any {
        this.eventEmitter.emit('close');
        if (this.producer) {
            this.producer.disconnect().then();
        }
        if (this.admin) {
            this.admin.disconnect().then();
        }
        if (this.kafka) {
            this.kafka = null;
        }
        this.eventEmitter = null;
    }

    encodeGif(gifDto: ConvertRangeDto): ConvertingStream {
        const newTopic = 'y2g.gif.' + gifDto.toString();
        return this.handleStream('y2g.gif.consumer.' + gifDto.toString(), 'y2g.gif', newTopic, gifDto);
    }

    encodePng(imageDto: ConvertTimeDto): ConvertingStream {
        const newTopic = 'y2g.png.' + imageDto.toString();
        return this.handleStream('y2g.png.consumer.' + imageDto.toString(), 'y2g.png', newTopic, imageDto);
    }

    encodeMp3(mp3Dto: ConvertRangeDto): ConvertingStream {
        const newTopic = 'y2g.mp3.' + mp3Dto.toString();
        return this.handleStream('y2g.mp3.consumer.' + mp3Dto.toString(), 'y2g.mp3', newTopic, mp3Dto);
    }

    async getQueueLength(type?: ConvertType): Promise<number> {
        const topic = type.toString();
        const seeks = await this.admin.fetchOffsets({groupId: this.CONSUMER_GROUP, topic});
        const seek = Math.min(...seeks.map(value => Number(value.offset)));
        const recentSeeks = await this.admin.fetchTopicOffsets(topic);
        const recentSeek = Math.max(...recentSeeks.map(value => Number(value.offset)));

        return Promise.resolve(recentSeek - seek);
    }

    private async downloadFile(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const lastPath = url.split('/').pop();
            const path = join(DOWNLOAD_PATH, lastPath);
            fs.stat(path, (err, stat) => {
                if (stat) {
                    return resolve(lastPath);
                }
                console.log('download!');
                got.stream(url)
                    .pipe(fs.createWriteStream(path))
                    .on('error', (e) => {
                        reject(e);
                    }).on('close', () => {
                        resolve(lastPath);
                    });
            });
        });
    }

    private handleStream(groupId: string, topic: string, newTopic: string, dto: any): ConvertingStream {
        const readable = new ConvertingStream();

        (async () => {
            const consumer = this.kafka.consumer({groupId});
            const closeCallback = () => {
                this.eventEmitter.off('close', closeCallback);
                this.admin.deleteTopics({topics: [newTopic]}).catch((e) => {
                    this.logger.error('queue broker delete topic error', e);
                });
                consumer.disconnect().then();
            };
            let timeout;


            this.eventEmitter.on('close', closeCallback);
            await consumer.subscribe({topic: newTopic});
            await consumer.run({
                eachMessage: async ({topic, partition, message}) => {
                    assert.strictEqual(newTopic, topic);
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }

                    const json = JSON.parse(message.value.toString());
                    if (json.data) {
                        readable.push(json.data);
                    } else if (json.result) {
                        try {
                            readable.push(await this.downloadFile(json.result));
                            readable.destroy();
                        } catch (e) {
                            this.logger.error('download file error', e);
                            readable.destroy(e);
                        } finally {
                            closeCallback();
                        }

                    } else if (json.error) {
                        readable.destroy(json.error);
                        consumer.disconnect().finally();
                    }
                }
            });
            timeout = setTimeout(async () => {
                await this.producer.send({
                    topic: topic,
                    messages: [{key: dto.toString(), value: JSON.stringify(dto)}]
                });
            }, 1000)


            if (readable.destroyed) {
                return closeCallback();
            }
            readable.on('close', () => {
                closeCallback();
            });
        })();

        return readable;
    }
}