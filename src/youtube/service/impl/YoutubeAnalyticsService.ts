import {InjectRepository} from "@nestjs/typeorm";
import {VideoEntity} from "../../entity/Video.entity";
import {LessThan, Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {SaveRequestDto} from "../../dto/SaveRequestDto";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";


@Injectable()
@CommandHandler(SaveRequestDto)
export class YoutubeAnalyticsService implements ICommandHandler<SaveRequestDto> {

    private readonly TIME = 30 * 60 * 1000;

    constructor(@InjectRepository(VideoEntity) private videoRepository: Repository<VideoEntity>) {
    }

    async execute(command: SaveRequestDto): Promise<any> {
        const video = new VideoEntity();
        video.v = command.v;
        video.type = command.type;
        video.path = command.path;

        await this.videoRepository.save(video);
    }

    getOldImg(): Promise<VideoEntity[]> {
        const time = new Date(Date.now() - this.TIME);
        return this.videoRepository.find({where : [{removed: true}, {date: LessThan(time)} ] });
    }

    setRemoved(ids: number[]): void {
        this.videoRepository.update(ids, {removed: true}).then();
    }
}