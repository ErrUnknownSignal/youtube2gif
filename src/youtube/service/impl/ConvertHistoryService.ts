import {InjectRepository} from "@nestjs/typeorm";
import {VideoEntity} from "../../entity/Video.entity";
import {LessThan, Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {SaveRequestDto} from "../../dto/SaveRequestDto";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";


@Injectable()
@CommandHandler(SaveRequestDto)
export class ConvertHistoryService implements ICommandHandler<SaveRequestDto> {

    private readonly REMOVE_TIME = 30 * 60 * 1000;

    constructor(@InjectRepository(VideoEntity) private videoRepository: Repository<VideoEntity>) {
    }

    async execute(command: SaveRequestDto): Promise<any> {
        const video = new VideoEntity();
        video.v = command.v;
        video.type = command.type;
        video.path = command.path;

        await this.videoRepository.save(video);
    }

    async getNotRemovedOldImage(): Promise<VideoEntity[]> {
        const date = new Date(Date.now() - this.REMOVE_TIME);
        return await this.videoRepository.find({where: {removed: false, date: LessThan(date)}, order: {id: 'ASC'}, take: 128})
    }

    async setRemoveImage(ids: number[]): Promise<void> {
        await this.videoRepository.update(ids, {removed: true}).then();
    }
}