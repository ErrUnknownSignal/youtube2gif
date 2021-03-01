import {InjectRepository} from "@nestjs/typeorm";
import {VideoEntity} from "../../entity/Video.entity";
import {In, Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {SaveRequestDto} from "../../dto/SaveRequestDto";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";


@Injectable()
@CommandHandler(SaveRequestDto)
export class ConvertHistoryService implements ICommandHandler<SaveRequestDto> {

    constructor(@InjectRepository(VideoEntity) private videoRepository: Repository<VideoEntity>) {
    }

    async execute(command: SaveRequestDto): Promise<any> {
        const video = new VideoEntity();
        video.v = command.v;
        video.type = command.type;
        video.path = command.path;
        video.meta = command.meta;

        await this.videoRepository.save(video);
    }

    async getCachedFile(v: string, meta: string): Promise<string> {
        const entities = await this.videoRepository.find({where: {v: v, removed: false, meta: meta}});
        if (entities && entities.length > 0) {
            return entities[0].path;
        }
        return;
    }

    async setRemoveFile(paths: string[]): Promise<void> {
        const list = await this.videoRepository.find({where: {path: In(paths), removed: false}});
        for (const l of list) {
            l.removed = true;
        }
        await this.videoRepository.save(list);
    }
}