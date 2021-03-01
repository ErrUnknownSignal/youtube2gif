import {EncodingWorker} from "../EncodingWorker";
import {Inject, Injectable, Logger, OnModuleDestroy} from "@nestjs/common";
import {Admin, Consumer, Kafka, Producer} from "kafkajs";
import {TemporaryFileService} from "../TemporaryFileService";
import {ConvertRangeDto} from "../../../youtube/dto/ConvertRangeDto";
import {ConvertTimeDto} from "../../../youtube/dto/ConvertTimeDto";
import * as os from 'os';
import {FFMPEGService} from "../FFMPEGService";
import {VideoQuality} from "../../../youtube/enums/VideoQuality";
import {AudioQuality} from "../../../youtube/enums/AudioQuality";


@Injectable()
export class QueueWorkerService extends EncodingWorker<void> implements OnModuleDestroy {

    private readonly logger = new Logger(QueueWorkerService.name);

    private readonly producer: Producer;
    private consumer: Consumer;
    private readonly admin: Admin;
    private readonly SERVER_IP: string;

    constructor(@Inject('TemporaryFileService') private readonly temporaryFileService: TemporaryFileService,
                private readonly ffmpegService: FFMPEGService,
                private kafka: Kafka,
                @Inject('workerGroupId') private readonly CONSUMER_GROUP: string) {
        super();
        this.producer = this.kafka.producer();
        this.producer.connect().catch((e) => {
            this.logger.error('queue worker producer connect error', e);
            throw e;
        });
        this.admin = this.kafka.admin();
        this.admin.connect().catch((e) => {
            this.logger.error('queue worker admin connect error', e);
            throw e;
        });
        this.setConsumer().finally();

        // https://unix.stackexchange.com/questions/98923/programmatically-extract-private-ip-addresses
        const privateIPRegex = /(192\.168|10\.|172\.1[6789]\.|172\.2[0-9]\.|172\.3[01]\.)/;
        const networks = os.networkInterfaces();
        for (const key in networks) {
            for (const inf of networks[key]) {
                if (!inf.internal && inf.family === 'IPv4' && !privateIPRegex.test(inf.address)) {
                    this.SERVER_IP = inf.address;
                    break;
                }
            }
        }
    }

    onModuleDestroy(): any {
        if (this.consumer) {
            this.consumer.disconnect().then();
        }
        if (this.producer) {
            this.producer.disconnect().then();
        }
        if (this.admin) {
            this.admin.disconnect().then();
        }
        if (this.kafka) {
            this.kafka = null;
        }
    }

    encodeGif(gifDto: ConvertRangeDto, bundle: {[key: string]: any}): void {
        const newTopic = 'y2g.gif.' + gifDto.toString();
        this.getVideoDownloadUrl(gifDto.v, VideoQuality[Object.keys(VideoQuality)[gifDto.quality]]).then((url) => {
            const tempFile = this.temporaryFileService.createTemporaryFile('gif');
            const args = ['-ss', String(gifDto.start), '-t', String(gifDto.time), '-i', url, '-y', tempFile[0]];
            this.handleStream(args, tempFile[2], newTopic, bundle);

        }).catch((error) => {
            this.producer.send({topic: newTopic, messages: [{key: error.toString(), value: JSON.stringify({error})}]}).catch((e) => {
                this.logger.error('encodeGif fail to send error', e);
            });
        });
    }

    encodePng(imageDto: ConvertTimeDto, bundle: {[key: string]: any}): void {
        const newTopic = 'y2g.png.' + imageDto.toString();
        this.getVideoDownloadUrl(imageDto.v, VideoQuality[Object.keys(VideoQuality)[imageDto.quality]]).then((url) => {
            const tempFile = this.temporaryFileService.createTemporaryFile('png');
            const args = ['-ss', String(imageDto.time), '-i', url, '-frames:v', '1', '-an', '-y', tempFile[0]];
            this.handleStream(args, tempFile[2], newTopic, bundle);

        }).catch((error) => {
            this.producer.send({topic: newTopic, messages: [{key: error.toString(), value: JSON.stringify({error})}]}).catch((e) => {
                this.logger.error('encodePng fail to send error', e);
            });
        });
    }

    encodeMp3(mp3Dto: ConvertRangeDto, bundle: {[key: string]: any}): void {
        const newTopic = 'y2g.mp3.' + mp3Dto.toString();
        this.getAudioDownloadUrl(mp3Dto.v, AudioQuality[Object.keys(AudioQuality)[mp3Dto.quality]]).then((url) => {
            const tempFile = this.temporaryFileService.createTemporaryFile('mp3');
            const args = ['-ss', String(mp3Dto.start), '-t', String(mp3Dto.time), '-i', url, '-y', tempFile[0]];
            this.handleStream(args, tempFile[2], newTopic, bundle);

        }).catch((error) => {
            this.producer.send({topic: newTopic, messages: [{key: error.toString(), value: JSON.stringify({error})}]}).catch((e) => {
                this.logger.error('encodeMp3 fail to send error', e);
            });
        });
    }


    private handleStream(args: string[], path: string, returnTopic: string, bundle: {[key: string]: any}): void {
        let committed = false;
        const commit = () => {
            if (committed) {
                return;
            }
            committed = true;
            // console.log('commit', bundle);
            this.consumer.commitOffsets([{topic: bundle.topic, partition: bundle.partition, offset: bundle.offset}]).catch((e) => {
                this.logger.error('queue worker handleStream commit offset error', e);
            });
        };


        this.producer.send({topic: returnTopic, messages: [{key: 'hello', value: JSON.stringify({data: '00:00:00.00'})}]}).then((v) => {
            // console.log('worker send hello message', v);
            const resultStream = this.ffmpegService.convertStream(args);
            resultStream.on('data', (data) => {
                const str = data.toString();
                this.producer.send({topic: returnTopic, messages: [{key: str, value: JSON.stringify({data: str})}]}).catch((e) => {
                    this.logger.error('queue worker send data on returnTopic error', e);
                });
            });
            resultStream.on('error', (error) => {
                this.producer.send({topic: returnTopic, messages: [{key: error.toString(), value: JSON.stringify({error})}]}).catch((e) => {
                    this.logger.error('queue worker send error on returnTopic error', e);
                });
                commit();
            });
            resultStream.on('close', () => {
                const url = `http://${this.SERVER_IP}:${process.env.PORT || 3000}/static/download/${path}`;
                this.producer.send({topic: returnTopic, messages: [{key: url, value: JSON.stringify({result: url})}]}).catch((e) => {
                    this.logger.error('queue worker send close on returnTopic error', e);
                });
                commit();
            });

        }).catch((e) => {
            this.logger.error('queue worker handshake error', e);
            commit();
        });
    }

    private async lastOffset(groupId: string, topic: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.admin.fetchOffsets({groupId, topic}).then((seeks) => {
                resolve(Math.max(...seeks.map(value => Number(value.offset))));
            }).catch((e) => {
                this.logger.error(`fetchOffset on error ${groupId} ${topic}`, e);
                resolve(-Infinity);
            });
        });
    }

    public async setConsumer(): Promise<void> {
        if (this.consumer) {
            throw new Error('consumer is already connected');
        }
        const gifOffset = await this.lastOffset(this.CONSUMER_GROUP, 'y2g.gif');
        const pngOffset = await this.lastOffset(this.CONSUMER_GROUP, 'y2g.png');
        const mp3Offset = await this.lastOffset(this.CONSUMER_GROUP, 'y2g.mp3');
        // console.log('offset', gifOffset, pngOffset, mp3Offset);

        this.consumer = this.kafka.consumer({groupId: this.CONSUMER_GROUP});
        await this.consumer.subscribe({topic: 'y2g.gif'});
        await this.consumer.subscribe({topic: 'y2g.png'});
        await this.consumer.subscribe({topic: 'y2g.mp3'});
        await this.consumer.run({
            autoCommit: false,
            eachMessage: async ({topic, partition, message}) => {
                // console.log('eachMessage', topic, partition, message);
                const json = JSON.parse(message.value.toString());
                //TODO fix shitty code
                if (topic === 'y2g.gif') {
                    if (Number(message.offset) > gifOffset) {
                        this.encodeGif(Object.assign(new ConvertRangeDto(), json), {
                            topic,
                            partition,
                            offset: message.offset
                        });
                    }
                } else if (topic === 'y2g.png') {
                    if (Number(message.offset) > pngOffset) {
                        this.encodePng(Object.assign(new ConvertTimeDto(), json), {
                            topic,
                            partition,
                            offset: message.offset
                        });
                    }
                } else if (topic === 'y2g.mp3') {
                    if (Number(message.offset) > mp3Offset) {
                        this.encodeMp3(Object.assign(new ConvertRangeDto(), json), {
                            topic,
                            partition,
                            offset: message.offset
                        });
                    }
                }
            }
        });
    }

    public destroyConsumer(): void {
        if (this.consumer) {
            this.consumer.disconnect().finally(() => {
                this.consumer = null;
            });
        }
    }
}