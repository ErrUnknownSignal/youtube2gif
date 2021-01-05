import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {ApiController} from "./controller/api.controller";
import {YoutubeService} from "./service/impl/youtube.service";
import {TemporaryFileServiceImpl} from "./service/impl/TemporaryFileServiceImpl";
import {ConvertHistoryService} from "./service/impl/ConvertHistoryService";
import {TypeOrmModule} from "@nestjs/typeorm";
import {VideoEntity} from "./entity/Video.entity";
import {GarbageCollect} from "./tasks/GarbageCollect";


@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([VideoEntity])
    ],
    controllers: [ApiController],
    providers: [
        ConvertHistoryService,
        YoutubeService,
        GarbageCollect,
        {provide: 'TemporaryFileService', useClass: TemporaryFileServiceImpl}
    ],
})
export class YoutubeModule {

}