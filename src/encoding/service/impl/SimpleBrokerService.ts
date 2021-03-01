import {EncodingBroker} from "../EncodingBroker";
import {Injectable} from "@nestjs/common";
import {EncodingWorker} from "../EncodingWorker";
import {ConvertRangeDto} from "../../../youtube/dto/ConvertRangeDto";
import {ConvertTimeDto} from "../../../youtube/dto/ConvertTimeDto";
import {ConvertingStream} from "../../../youtube/utils/ConvertingStream";
import {ConvertType} from "../../../youtube/enums/ConvertType";


@Injectable()
export class SimpleBrokerService extends EncodingBroker {

    private readonly gifQueue = [];
    private gifOffset = 0;
    private readonly pngQueue = [];
    private pngOffset = 0;
    private readonly mp3Queue = [];
    private mp3Offset = 0;


    // constructor(@Inject('SimpleEncoder') private readonly encodingHandler: EncodingHandler) {
    constructor(private readonly encodingWorker: EncodingWorker<ConvertingStream>) {
        super();
        console.log(encodingWorker);
    }

    encodeGif(gifDto: ConvertRangeDto): ConvertingStream {
        return this.encodingWorker.encodeGif(gifDto, {});
    }

    encodePng(imageDto: ConvertTimeDto): ConvertingStream {
        return this.encodingWorker.encodePng(imageDto, {});
    }

    encodeMp3(mp3Dto: ConvertRangeDto): ConvertingStream {
        return this.encodingWorker.encodeMp3(mp3Dto, {});
    }

    async getQueueLength(type: ConvertType): Promise<number> {
        switch (type) {
            case ConvertType.GIF:
                return this.gifQueue.length - this.gifOffset;
            case ConvertType.PNG:
                return this.pngQueue.length - this.pngOffset;
            case ConvertType.MP3:
                return this.mp3Queue.length - this.mp3Offset;
        }
        return Promise.resolve(0);
    }
}